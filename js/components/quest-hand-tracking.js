/**
 * Quest Hand Tracking - Sistema de rastreamento de mãos nativo para Meta Quest 3
 * 
 * Este componente implementa:
 * - Rastreamento preciso das mãos e dedos
 * - Gestos para atirar, recarregar e interagir
 * - Feedback visual das mãos virtuais
 * - Detecção de colisão para interação com objetos
 */

AFRAME.registerComponent('quest-hand-tracking', {
    schema: {
        hand: { type: 'string', default: 'right', oneOf: ['left', 'right'] },
        
        // Configurações de gestos
        shootGesture: { type: 'string', default: 'point' }, // point, fist, pinch
        reloadGesture: { type: 'string', default: 'grab' },
        interactGesture: { type: 'string', default: 'pinch' },
        
        // Configurações visuais
        showHandModel: { type: 'boolean', default: true },
        handOpacity: { type: 'number', default: 0.8 },
        
        // Configurações de sensibilidade
        gestureThreshold: { type: 'number', default: 0.8 },
        holdTime: { type: 'number', default: 500 }, // ms para manter gesto
        
        // Configurações de haptic feedback
        hapticFeedback: { type: 'boolean', default: true },
        hapticIntensity: { type: 'number', default: 0.5 }
    },

    init: function() {
        this.handData = null;
        this.previousGesture = null;
        this.gestureStartTime = 0;
        this.isGestureActive = false;
        
        // Estados dos gestos
        this.gestureStates = {
            point: false,
            fist: false,
            grab: false,
            pinch: false,
            peace: false,
            thumbsUp: false
        };
        
        // Configurar eventos genéricos (gestos customizados, pinch)
        this.setupEventListeners();
        
        console.log(`👋 Quest Hand Tracking inicializado para mão ${this.data.hand}`);
    },

    setupHandTracking: function() {
        // Configurar WebXR hand tracking
        this.el.setAttribute('hand-tracking-controls', {
            hand: this.data.hand,
            modelStyle: 'mesh',
            modelColor: '#FFE0BD' // Cor da pele
        });
        
        // Adicionar raycaster para interação
        this.el.setAttribute('raycaster', {
            objects: '.interactive',
            far: 10,
            lineColor: this.data.hand === 'right' ? '#FF0000' : '#0000FF',
            lineOpacity: 0.5
        });
    },

    setupHandModel: function() {
        // Criar modelo visual da mão
        const handModel = document.createElement('a-entity');
        handModel.setAttribute('id', `hand-model-${this.data.hand}`);
        handModel.setAttribute('gltf-model', '#handModel');
        handModel.setAttribute('scale', '1 1 1');
        handModel.setAttribute('material', {
            transparent: true,
            opacity: this.data.handOpacity
        });
        
        this.el.appendChild(handModel);
        this.handModel = handModel;
    },

    setupEventListeners: function() {
        // Eventos de hand tracking (o listener de extras-ready é adicionado após init seguro)
        this.el.addEventListener('pinchstarted', this.onPinchStart.bind(this));
        this.el.addEventListener('pinchended', this.onPinchEnd.bind(this));
        
        // Eventos personalizados de gestos
        this.el.addEventListener('gesture-detected', this.onGestureDetected.bind(this));
        this.el.addEventListener('gesture-ended', this.onGestureEnded.bind(this));
    },

    tick: function() {
        if (!this.handData) return;
        
        // Atualizar detecção de gestos
        this.updateGestureDetection();
        
        // Atualizar posição do raycaster baseado no dedo indicador
        this.updateRaycastDirection();
    },

    onHandTrackingReady: function() {
        console.log(`✅ Hand tracking pronto para mão ${this.data.hand}`);
        
        // Obter dados da mão
        this.handData = this.el.components['hand-tracking-controls'];
        
        // Configurar joints específicos que vamos monitorar
        this.setupJointTracking();
    },

    onPinchStart: function(event) {
        console.log(`👌 Pinch iniciado na mão ${this.data.hand}`);
        this.triggerInteraction();
    },

    onPinchEnd: function(event) {
        console.log(`👌 Pinch finalizado na mão ${this.data.hand}`);
    },

    onGestureDetected: function(event) {
        console.log(`✋ Gesto detectado: ${event.detail.gesture} na mão ${this.data.hand}`);
        this.processGestureAction(event.detail.gesture, 'start', 0);
    },

    onGestureEnded: function(event) {
        console.log(`✋ Gesto finalizado: ${event.detail.gesture} na mão ${this.data.hand}`);
        this.processGestureAction(event.detail.gesture, 'end', event.detail.duration || 0);
    },

    setupJointTracking: function() {
        // Joints importantes para gestos
        this.trackedJoints = {
            wrist: 'wrist',
            thumb_tip: 'thumb-tip',
            index_tip: 'index-finger-tip',
            middle_tip: 'middle-finger-tip',
            ring_tip: 'ring-finger-tip',
            pinky_tip: 'pinky-finger-tip',
            index_pip: 'index-finger-pip',
            middle_pip: 'middle-finger-pip'
        };
    },

    updateGestureDetection: function() {
        if (!this.handData || !this.handData.joints) return;
        
        const joints = this.handData.joints;
        
        // Detectar diferentes gestos
        const currentGestures = {
            point: this.detectPointGesture(joints),
            fist: this.detectFistGesture(joints),
            grab: this.detectGrabGesture(joints),
            pinch: this.detectPinchGesture(joints),
            peace: this.detectPeaceGesture(joints),
            thumbsUp: this.detectThumbsUpGesture(joints)
        };
        
        // Processar mudanças de gestos
        this.processGestureChanges(currentGestures);
    },

    detectPointGesture: function(joints) {
        if (!joints[this.trackedJoints.index_tip] || !joints[this.trackedJoints.middle_tip]) return false;
        
        const indexTip = joints[this.trackedJoints.index_tip].position;
        const middleTip = joints[this.trackedJoints.middle_tip].position;
        const indexPip = joints[this.trackedJoints.index_pip].position;
        
        // Dedo indicador estendido, outros dobrados
        const indexExtended = indexTip.y > indexPip.y;
        const middleFolded = middleTip.y < indexPip.y;
        
        return indexExtended && middleFolded;
    },

    detectFistGesture: function(joints) {
        const tips = [
            this.trackedJoints.index_tip,
            this.trackedJoints.middle_tip,
            this.trackedJoints.ring_tip,
            this.trackedJoints.pinky_tip
        ];
        
        const wrist = joints[this.trackedJoints.wrist];
        if (!wrist) return false;
        
        // Todos os dedos dobrados (tips próximos do pulso)
        let foldedCount = 0;
        tips.forEach(tipJoint => {
            const tip = joints[tipJoint];
            if (tip) {
                const distance = this.calculateDistance(tip.position, wrist.position);
                if (distance < 0.08) foldedCount++; // 8cm threshold
            }
        });
        
        return foldedCount >= 3; // Pelo menos 3 dedos dobrados
    },

    detectGrabGesture: function(joints) {
        const thumbTip = joints[this.trackedJoints.thumb_tip];
        const indexTip = joints[this.trackedJoints.index_tip];
        
        if (!thumbTip || !indexTip) return false;
        
        // Polegar e indicador próximos (gesto de pegar)
        const distance = this.calculateDistance(thumbTip.position, indexTip.position);
        return distance < 0.03; // 3cm threshold
    },

    detectPinchGesture: function(joints) {
        const thumbTip = joints[this.trackedJoints.thumb_tip];
        const indexTip = joints[this.trackedJoints.index_tip];
        
        if (!thumbTip || !indexTip) return false;
        
        // Pinça precisa (polegar e indicador muito próximos)
        const distance = this.calculateDistance(thumbTip.position, indexTip.position);
        return distance < 0.02; // 2cm threshold
    },

    detectPeaceGesture: function(joints) {
        const indexTip = joints[this.trackedJoints.index_tip];
        const middleTip = joints[this.trackedJoints.middle_tip];
        const ringTip = joints[this.trackedJoints.ring_tip];
        const indexPip = joints[this.trackedJoints.index_pip];
        
        if (!indexTip || !middleTip || !ringTip || !indexPip) return false;
        
        // Indicador e médio estendidos, anelar dobrado
        const indexExtended = indexTip.y > indexPip.y;
        const middleExtended = middleTip.y > indexPip.y;
        const ringFolded = ringTip.y < indexPip.y;
        
        return indexExtended && middleExtended && ringFolded;
    },

    detectThumbsUpGesture: function(joints) {
        const thumbTip = joints[this.trackedJoints.thumb_tip];
        const indexTip = joints[this.trackedJoints.index_tip];
        const wrist = joints[this.trackedJoints.wrist];
        
        if (!thumbTip || !indexTip || !wrist) return false;
        
        // Polegar para cima, outros dedos dobrados
        const thumbUp = thumbTip.y > wrist.y + 0.05;
        const indexDown = indexTip.y < wrist.y;
        
        return thumbUp && indexDown;
    },

    processGestureChanges: function(currentGestures) {
        Object.keys(currentGestures).forEach(gesture => {
            const isActive = currentGestures[gesture];
            const wasActive = this.gestureStates[gesture];
            
            if (isActive && !wasActive) {
                // Gesto iniciado
                this.onGestureStart(gesture);
            } else if (!isActive && wasActive) {
                // Gesto terminado
                this.onGestureEnd(gesture);
            }
            
            this.gestureStates[gesture] = isActive;
        });
    },

    onGestureStart: function(gesture) {
        console.log(`👋 Gesto iniciado: ${gesture} (${this.data.hand})`);
        
        this.gestureStartTime = Date.now();
        
        // Feedback haptic
        if (this.data.hapticFeedback) {
            this.triggerHapticFeedback(0.3, 100);
        }
        
        // Processar ações baseadas no gesto
        this.processGestureAction(gesture, 'start');
        
        // Emitir evento
        this.el.emit('gesture-started', { 
            gesture: gesture, 
            hand: this.data.hand,
            timestamp: this.gestureStartTime
        });
    },

    onGestureEnd: function(gesture) {
        const duration = Date.now() - this.gestureStartTime;
        console.log(`👋 Gesto terminado: ${gesture} (${this.data.hand}) - Duração: ${duration}ms`);
        
        // Processar ação de fim do gesto
        this.processGestureAction(gesture, 'end', duration);
        
        // Emitir evento
        this.el.emit('gesture-ended', { 
            gesture: gesture, 
            hand: this.data.hand,
            duration: duration
        });
    },

    processGestureAction: function(gesture, phase, duration) {
        // Apenas processar gestos da mão direita para ações principais
        if (this.data.hand !== 'right') return;
        
        switch (gesture) {
            case 'point':
                if (phase === 'start' && gesture === this.data.shootGesture) {
                    this.triggerShoot();
                }
                break;
                
            case 'fist':
                if (phase === 'end' && duration > this.data.holdTime && gesture === this.data.reloadGesture) {
                    this.triggerReload();
                }
                break;
                
            case 'pinch':
                if (phase === 'start' && gesture === this.data.interactGesture) {
                    this.triggerInteraction();
                }
                break;
                
            case 'peace':
                if (phase === 'start') {
                    this.triggerSpecialAction();
                }
                break;
                
            case 'thumbsUp':
                if (phase === 'start') {
                    this.triggerPositiveAction();
                }
                break;
        }
    },

    triggerShoot: function() {
        console.log('🔫 Disparando com gesto!');
        
        // Emitir evento de disparo
        this.el.sceneEl.emit('weapon-fire', {
            source: 'hand-gesture',
            hand: this.data.hand,
            position: this.el.getAttribute('position'),
            direction: this.getRaycastDirection()
        });
        
        // Feedback haptic forte
        this.triggerHapticFeedback(0.8, 200);
    },

    triggerReload: function() {
        console.log('🔄 Recarregando com gesto!');
        
        // Emitir evento de recarga
        this.el.sceneEl.emit('weapon-reload', {
            source: 'hand-gesture',
            hand: this.data.hand
        });
        
        // Feedback haptic médio
        this.triggerHapticFeedback(0.5, 300);
    },

    triggerInteraction: function() {
        console.log('🤏 Interagindo com gesto!');
        
        // Verificar se há objeto para interagir
        const raycaster = this.el.components.raycaster;
        if (raycaster && raycaster.intersectedEl) {
            const target = raycaster.intersectedEl;
            
            // Emitir evento de interação
            target.emit('hand-interaction', {
                hand: this.data.hand,
                gesture: 'pinch'
            });
        }
        
        // Feedback haptic suave
        this.triggerHapticFeedback(0.3, 150);
    },

    triggerSpecialAction: function() {
        console.log('✌️ Ação especial com gesto de paz!');
        
        // Pode ser usado para menu, pausa, etc.
        this.el.sceneEl.emit('special-gesture', {
            gesture: 'peace',
            hand: this.data.hand
        });
    },

    triggerPositiveAction: function() {
        console.log('👍 Gesto positivo!');
        
        // Pode ser usado para confirmações, likes, etc.
        this.el.sceneEl.emit('positive-gesture', {
            gesture: 'thumbsUp',
            hand: this.data.hand
        });
    },

    updateRaycastDirection: function() {
        if (!this.handData || !this.handData.joints) return;
        
        const indexTip = this.handData.joints[this.trackedJoints.index_tip];
        const wrist = this.handData.joints[this.trackedJoints.wrist];
        
        if (indexTip && wrist) {
            // Calcular direção do dedo indicador
            const direction = new THREE.Vector3()
                .subVectors(indexTip.position, wrist.position)
                .normalize();
            
            // Atualizar raycaster
            const raycaster = this.el.components.raycaster;
            if (raycaster) {
                raycaster.raycaster.set(indexTip.position, direction);
            }
        }
    },

    getRaycastDirection: function() {
        const raycaster = this.el.components.raycaster;
        return raycaster ? raycaster.raycaster.ray.direction : new THREE.Vector3(0, 0, -1);
    },

    triggerHapticFeedback: function(intensity, duration) {
        if (!this.data.hapticFeedback) return;
        
        // Tentar usar WebXR haptic feedback
        const session = this.el.sceneEl.xrSession;
        if (session && session.inputSources) {
            session.inputSources.forEach(inputSource => {
                if (inputSource.hand && inputSource.gamepad && inputSource.gamepad.hapticActuators) {
                    inputSource.gamepad.hapticActuators[0].pulse(
                        intensity * this.data.hapticIntensity, 
                        duration
                    );
                }
            });
        }
    },

    calculateDistance: function(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    },

    // Métodos públicos para configuração
    setGestureThreshold: function(threshold) {
        this.data.gestureThreshold = threshold;
    },

    enableGesture: function(gesture, enabled) {
        // Implementar habilitação/desabilitação de gestos específicos
        console.log(`${enabled ? 'Habilitando' : 'Desabilitando'} gesto: ${gesture}`);
    },

    getHandStatus: function() {
        return {
            hand: this.data.hand,
            isTracking: !!this.handData,
            activeGestures: Object.keys(this.gestureStates).filter(g => this.gestureStates[g]),
            position: this.el.getAttribute('position')
        };
    }
});

console.log('👋 Quest Hand Tracking component registrado');