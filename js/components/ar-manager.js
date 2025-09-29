/**
 * AR Manager - Gerencia funcionalidades de Realidade Aumentada para Meta Quest 3
 * 
 * Este componente é responsável por:
 * - Detectar planos horizontais no ambiente real
 * - Ancorar a arena de paintball no mundo real
 * - Gerenciar oclusão e iluminação baseada no ambiente
 * - Configurar hand tracking nativo do Quest 3
 */

AFRAME.registerComponent('ar-manager', {
    schema: {
        // Configurações de detecção de planos
        planeDetection: { type: 'boolean', default: true },
        minPlaneSize: { type: 'number', default: 2.0 }, // Tamanho mínimo do plano em metros
        arenaScale: { type: 'number', default: 0.5 }, // Escala da arena (50% do tamanho original)
        
        // Configurações de ancoragem
        autoAnchor: { type: 'boolean', default: true },
        anchorTimeout: { type: 'number', default: 10000 }, // 10 segundos para encontrar plano
        
        // Configurações visuais
        showPlaneOutlines: { type: 'boolean', default: true },
        environmentLighting: { type: 'boolean', default: true }
    },

    init: function() {
        this.el.sceneEl.addEventListener('enter-vr', this.onEnterAR.bind(this));
        this.el.sceneEl.addEventListener('exit-vr', this.onExitAR.bind(this));
        
        this.detectedPlanes = new Map();
        this.arenaAnchored = false;
        this.arenaEntity = null;
        
        // Configurar WebXR para AR
        this.setupWebXRAR();
        
        console.log('🔍 AR Manager inicializado para Meta Quest 3');
    },

    setupWebXRAR: function() {
        // Configurar sessão AR com recursos necessários
        const sceneEl = this.el.sceneEl;
        
        // Configurar WebXR AR features
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                if (supported) {
                    console.log('✅ WebXR AR suportado');
                    this.setupARFeatures();
                } else {
                    console.warn('⚠️ WebXR AR não suportado neste dispositivo');
                    this.fallbackToVR();
                }
            });
        } else {
            console.warn('⚠️ WebXR não disponível');
            this.fallbackToVR();
        }
    },

    setupARFeatures: function() {
        const sceneEl = this.el.sceneEl;
        
        // Configurar recursos AR necessários
        sceneEl.setAttribute('webxr', {
            requiredFeatures: ['local', 'hand-tracking', 'plane-detection'],
            optionalFeatures: ['anchors', 'hit-test', 'light-estimation'],
            referenceSpaceType: 'local'
        });

        // Configurar detecção de planos
        if (this.data.planeDetection) {
            this.setupPlaneDetection();
        }
    },

    setupPlaneDetection: function() {
        // Listener para novos planos detectados
        this.el.sceneEl.addEventListener('ar-plane-detected', (event) => {
            this.onPlaneDetected(event.detail.plane);
        });

        // Listener para planos removidos
        this.el.sceneEl.addEventListener('ar-plane-removed', (event) => {
            this.onPlaneRemoved(event.detail.plane);
        });
    },

    onEnterAR: function() {
        console.log('🥽 Entrando em modo AR');
        
        // Ocultar background e configurar passthrough
        this.el.sceneEl.setAttribute('background', 'color', 'transparent');
        
        // Iniciar detecção de planos se habilitada
        if (this.data.planeDetection && this.data.autoAnchor) {
            this.startArenaPlacement();
        }

        // Configurar iluminação baseada no ambiente
        if (this.data.environmentLighting) {
            this.setupEnvironmentLighting();
        }
    },

    onExitAR: function() {
        console.log('🚪 Saindo do modo AR');
        
        // Restaurar background
        this.el.sceneEl.setAttribute('background', 'color', '#87CEEB');
        
        // Limpar planos detectados
        this.clearDetectedPlanes();
        this.arenaAnchored = false;
    },

    startArenaPlacement: function() {
        console.log('🎯 Iniciando posicionamento da arena...');
        
        // Mostrar instruções para o usuário
        this.showPlacementInstructions();
        
        // Timeout para ancoragem automática
        setTimeout(() => {
            if (!this.arenaAnchored && this.detectedPlanes.size > 0) {
                this.autoPlaceArena();
            }
        }, this.data.anchorTimeout);
    },

    showPlacementInstructions: function() {
        // Criar elemento de instrução flutuante
        const instructionEl = document.createElement('a-text');
        instructionEl.setAttribute('id', 'ar-instructions');
        instructionEl.setAttribute('value', 'Olhe para o chão para detectar uma superfície\npara posicionar a arena de paintball');
        instructionEl.setAttribute('position', '0 2 -3');
        instructionEl.setAttribute('align', 'center');
        instructionEl.setAttribute('color', '#FFFFFF');
        instructionEl.setAttribute('background', 'color: rgba(0,0,0,0.7); padding: 0.2');
        instructionEl.setAttribute('scale', '1.5 1.5 1.5');
        
        this.el.sceneEl.appendChild(instructionEl);
        
        // Remover após 8 segundos
        setTimeout(() => {
            const el = document.getElementById('ar-instructions');
            if (el) el.remove();
        }, 8000);
    },

    onPlaneDetected: function(plane) {
        console.log('🔍 Plano detectado:', plane);
        
        // Verificar se o plano é grande o suficiente
        if (this.isPlaneViable(plane)) {
            this.detectedPlanes.set(plane.id, plane);
            
            // Criar visualização do plano se habilitada
            if (this.data.showPlaneOutlines) {
                this.createPlaneVisualization(plane);
            }
            
            // Tentar ancorar arena automaticamente
            if (this.data.autoAnchor && !this.arenaAnchored) {
                this.tryAnchorArena(plane);
            }
        }
    },

    isPlaneViable: function(plane) {
        // Verificar se é um plano horizontal (chão)
        const normal = plane.orientation;
        const isHorizontal = Math.abs(normal.y) > 0.8; // Normal apontando para cima
        
        // Verificar tamanho mínimo
        const size = Math.min(plane.width, plane.height);
        const isLargeEnough = size >= this.data.minPlaneSize;
        
        return isHorizontal && isLargeEnough;
    },

    createPlaneVisualization: function(plane) {
        const planeEl = document.createElement('a-plane');
        planeEl.setAttribute('id', `ar-plane-${plane.id}`);
        planeEl.setAttribute('width', plane.width);
        planeEl.setAttribute('height', plane.height);
        planeEl.setAttribute('position', `${plane.position.x} ${plane.position.y} ${plane.position.z}`);
        planeEl.setAttribute('rotation', `${plane.rotation.x} ${plane.rotation.y} ${plane.rotation.z}`);
        planeEl.setAttribute('material', {
            color: '#00FF00',
            transparent: true,
            opacity: 0.3,
            side: 'double'
        });
        planeEl.setAttribute('class', 'ar-plane-outline');
        
        this.el.sceneEl.appendChild(planeEl);
    },

    tryAnchorArena: function(plane) {
        if (this.arenaAnchored) return;
        
        console.log('⚓ Ancorando arena no plano detectado');
        
        // Posicionar arena no centro do plano
        const arenaEl = document.getElementById('arena');
        if (arenaEl) {
            // Aplicar escala para AR
            arenaEl.setAttribute('scale', `${this.data.arenaScale} ${this.data.arenaScale} ${this.data.arenaScale}`);
            
            // Posicionar no plano
            arenaEl.setAttribute('position', `${plane.position.x} ${plane.position.y + 0.01} ${plane.position.z}`);
            arenaEl.setAttribute('rotation', `0 ${plane.rotation.y} 0`);
            
            this.arenaAnchored = true;
            this.arenaEntity = arenaEl;
            
            // Ocultar outlines dos planos
            this.hideAllPlaneOutlines();
            
            // Mostrar confirmação
            this.showArenaPlacedConfirmation();
        }
    },

    autoPlaceArena: function() {
        // Encontrar o melhor plano (maior e mais central)
        let bestPlane = null;
        let bestScore = 0;
        
        this.detectedPlanes.forEach((plane) => {
            const size = plane.width * plane.height;
            const distance = Math.sqrt(plane.position.x ** 2 + plane.position.z ** 2);
            const score = size / (1 + distance); // Maior e mais próximo = melhor
            
            if (score > bestScore) {
                bestScore = score;
                bestPlane = plane;
            }
        });
        
        if (bestPlane) {
            this.tryAnchorArena(bestPlane);
        }
    },

    showArenaPlacedConfirmation: function() {
        const confirmEl = document.createElement('a-text');
        confirmEl.setAttribute('value', '✅ Arena posicionada!\nO jogo pode começar');
        confirmEl.setAttribute('position', '0 2 -2');
        confirmEl.setAttribute('align', 'center');
        confirmEl.setAttribute('color', '#00FF00');
        confirmEl.setAttribute('background', 'color: rgba(0,0,0,0.8); padding: 0.2');
        confirmEl.setAttribute('scale', '1.2 1.2 1.2');
        
        this.el.sceneEl.appendChild(confirmEl);
        
        // Remover após 3 segundos
        setTimeout(() => confirmEl.remove(), 3000);
        
        // Disparar evento de arena pronta
        this.el.sceneEl.emit('arena-ready', { position: this.arenaEntity.getAttribute('position') });
    },

    hideAllPlaneOutlines: function() {
        const planeOutlines = document.querySelectorAll('.ar-plane-outline');
        planeOutlines.forEach(outline => {
            outline.setAttribute('visible', false);
        });
    },

    setupEnvironmentLighting: function() {
        // Configurar iluminação baseada no ambiente real
        const lightEl = document.querySelector('a-light[type="directional"]');
        if (lightEl) {
            // Usar estimativa de luz do ambiente se disponível
            lightEl.setAttribute('light', {
                type: 'directional',
                intensity: 0.8, // Reduzida para AR
                castShadow: true,
                shadowMapHeight: 1024,
                shadowMapWidth: 1024
            });
        }
    },

    onPlaneRemoved: function(plane) {
        this.detectedPlanes.delete(plane.id);
        
        // Remover visualização do plano
        const planeEl = document.getElementById(`ar-plane-${plane.id}`);
        if (planeEl) {
            planeEl.remove();
        }
    },

    clearDetectedPlanes: function() {
        // Remover todas as visualizações de planos
        const planeOutlines = document.querySelectorAll('.ar-plane-outline');
        planeOutlines.forEach(outline => outline.remove());
        
        this.detectedPlanes.clear();
    },

    fallbackToVR: function() {
        console.log('🔄 Fallback para modo VR tradicional');
        
        // Configurar para VR normal se AR não estiver disponível
        this.el.sceneEl.setAttribute('vr-mode-ui', 'enabled: true');
        this.el.sceneEl.setAttribute('background', 'color: #87CEEB');
        
        // Posicionar arena na posição padrão
        const arenaEl = document.getElementById('arena');
        if (arenaEl) {
            arenaEl.setAttribute('position', '0 0 0');
            arenaEl.setAttribute('scale', '1 1 1');
        }
    },

    // Método público para reposicionar arena manualmente
    repositionArena: function(position, rotation) {
        if (this.arenaEntity) {
            this.arenaEntity.setAttribute('position', position);
            if (rotation) {
                this.arenaEntity.setAttribute('rotation', rotation);
            }
            
            console.log('🔄 Arena reposicionada:', position);
        }
    },

    // Método público para obter status AR
    getARStatus: function() {
        return {
            isARMode: this.el.sceneEl.is('ar-mode'),
            arenaAnchored: this.arenaAnchored,
            planesDetected: this.detectedPlanes.size,
            arenaPosition: this.arenaEntity ? this.arenaEntity.getAttribute('position') : null
        };
    }
});

console.log('📱 AR Manager component registrado para Meta Quest 3');