// Sistema de gerenciamento de efeitos visuais e sonoros
class EffectsManager {
    constructor() {
        this.scene = null;
        this.audioContext = null;
        this.soundBuffers = new Map();
        this.activeSounds = new Map();
        this.particleSystems = new Map();
        this.effectsPool = new Map();
        this.maxParticles = getConfig('performance.maxParticles') || 100;
        this.currentParticleCount = 0;
        
        this.init();
    }

    init() {
        this.scene = document.querySelector('a-scene');
        this.setupAudioContext();
        this.createEffectPools();
        this.loadSounds();
        
        console.log('✅ EffectsManager inicializado');
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Configurar áudio espacial
            if (this.audioContext.createPanner) {
                this.spatialAudioSupported = true;
                console.log('✅ Áudio espacial suportado');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao configurar contexto de áudio:', error);
        }
    }

    createEffectPools() {
        // Pool de partículas para reutilização
        this.effectsPool.set('muzzleFlash', []);
        this.effectsPool.set('hitEffect', []);
        this.effectsPool.set('bloodSplatter', []);
        this.effectsPool.set('sparkEffect', []);
        this.effectsPool.set('smokeTrail', []);
        this.effectsPool.set('explosion', []);
        
        // Pré-criar alguns efeitos
        this.preCreateEffects();
    }

    preCreateEffects() {
        // Pré-criar efeitos de muzzle flash
        for (let i = 0; i < 10; i++) {
            const effect = this.createMuzzleFlashElement();
            effect.setAttribute('visible', false);
            this.effectsPool.get('muzzleFlash').push(effect);
            this.scene.appendChild(effect);
        }

        // Pré-criar efeitos de hit
        for (let i = 0; i < 20; i++) {
            const effect = this.createHitEffectElement();
            effect.setAttribute('visible', false);
            this.effectsPool.get('hitEffect').push(effect);
            this.scene.appendChild(effect);
        }
    }

    async loadSounds() {
        const sounds = getConfig('audio.sounds') || {};
        
        for (const [soundName, soundPath] of Object.entries(sounds)) {
            try {
                const response = await fetch(soundPath);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.soundBuffers.set(soundName, audioBuffer);
                console.log(`✅ Som carregado: ${soundName}`);
            } catch (error) {
                console.warn(`⚠️ Erro ao carregar som ${soundName}:`, error);
                // Criar som sintético como fallback
                this.createSyntheticSound(soundName);
            }
        }
    }

    createSyntheticSound(soundName) {
        // Criar sons sintéticos simples para fallback
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        switch (soundName) {
            case 'pistol-shot':
                this.generateGunshot(data, sampleRate);
                break;
            case 'sniper-shot':
                this.generateSniperShot(data, sampleRate);
                break;
            case 'hit-marker':
                this.generateHitMarker(data, sampleRate);
                break;
            case 'reload':
                this.generateReload(data, sampleRate);
                break;
            default:
                this.generateGenericSound(data, sampleRate);
        }

        this.soundBuffers.set(soundName, buffer);
    }

    generateGunshot(data, sampleRate) {
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 10);
            const pop = Math.sin(t * 1000) * Math.exp(-t * 50);
            data[i] = (noise + pop) * 0.3;
        }
    }

    generateSniperShot(data, sampleRate) {
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 5);
            const boom = Math.sin(t * 200) * Math.exp(-t * 20);
            data[i] = (noise + boom) * 0.4;
        }
    }

    generateHitMarker(data, sampleRate) {
        for (let i = 0; i < data.length * 0.1; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(t * 800) * Math.exp(-t * 20) * 0.2;
        }
    }

    generateReload(data, sampleRate) {
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            if (t < 0.1) {
                data[i] = (Math.random() * 2 - 1) * 0.1;
            } else if (t < 0.3) {
                data[i] = Math.sin(t * 400) * Math.exp(-(t - 0.1) * 10) * 0.15;
            }
        }
    }

    generateGenericSound(data, sampleRate) {
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(t * 440) * Math.exp(-t * 5) * 0.1;
        }
    }

    // Reproduzir som com posicionamento espacial
    playSound(soundName, position = null, volume = 1.0, pitch = 1.0) {
        if (!this.audioContext || !this.soundBuffers.has(soundName)) {
            console.warn(`Som não encontrado: ${soundName}`);
            return null;
        }

        try {
            const buffer = this.soundBuffers.get(soundName);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.playbackRate.value = pitch;
            
            // Configurar volume
            const masterVolume = getConfig('audio.masterVolume') || 1.0;
            const sfxVolume = getConfig('audio.sfxVolume') || 1.0;
            gainNode.gain.value = volume * masterVolume * sfxVolume;

            // Configurar áudio espacial se posição fornecida
            if (position && this.spatialAudioSupported) {
                const panner = this.audioContext.createPanner();
                panner.panningModel = 'HRTF';
                panner.distanceModel = 'inverse';
                panner.refDistance = 1;
                panner.maxDistance = 100;
                panner.rolloffFactor = 1;
                
                panner.setPosition(position.x, position.y, position.z);
                
                source.connect(gainNode);
                gainNode.connect(panner);
                panner.connect(this.audioContext.destination);
            } else {
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
            }

            source.start();
            
            // Armazenar referência para controle
            const soundId = Date.now() + Math.random();
            this.activeSounds.set(soundId, { source, gainNode });
            
            // Remover da lista quando terminar
            source.onended = () => {
                this.activeSounds.delete(soundId);
            };

            return soundId;
        } catch (error) {
            console.warn(`Erro ao reproduzir som ${soundName}:`, error);
            return null;
        }
    }

    // Parar som específico
    stopSound(soundId) {
        if (this.activeSounds.has(soundId)) {
            const { source } = this.activeSounds.get(soundId);
            source.stop();
            this.activeSounds.delete(soundId);
        }
    }

    // Parar todos os sons
    stopAllSounds() {
        for (const [soundId, { source }] of this.activeSounds) {
            source.stop();
        }
        this.activeSounds.clear();
    }

    // Criar efeito de muzzle flash
    createMuzzleFlash(position, direction, weaponType = 'pistol') {
        const effect = this.getPooledEffect('muzzleFlash') || this.createMuzzleFlashElement();
        
        // Configurar posição e rotação
        effect.setAttribute('position', position);
        effect.setAttribute('visible', true);
        
        // Configurar tamanho baseado no tipo de arma
        const scale = weaponType === 'sniper' ? '0.3 0.3 0.3' : '0.2 0.2 0.2';
        effect.setAttribute('scale', scale);
        
        // Animar o efeito
        effect.setAttribute('animation', {
            property: 'scale',
            to: '0 0 0',
            dur: 100,
            easing: 'easeOutQuad'
        });

        // Esconder após animação
        setTimeout(() => {
            effect.setAttribute('visible', false);
            this.returnToPool('muzzleFlash', effect);
        }, 100);

        // Reproduzir som
        const soundName = weaponType === 'sniper' ? 'sniper-shot' : 'pistol-shot';
        this.playSound(soundName, position, 0.8);
    }

    createMuzzleFlashElement() {
        const entity = document.createElement('a-entity');
        entity.setAttribute('geometry', {
            primitive: 'sphere',
            radius: 0.1
        });
        entity.setAttribute('material', {
            color: '#ffff00',
            emissive: '#ffaa00',
            shader: 'standard'
        });
        entity.setAttribute('light', {
            type: 'point',
            color: '#ffaa00',
            intensity: 2,
            distance: 5,
            decay: 2
        });
        return entity;
    }

    // Criar efeito de hit/impacto
    createHitEffect(position, normal, surface = 'player') {
        const effect = this.getPooledEffect('hitEffect') || this.createHitEffectElement();
        
        effect.setAttribute('position', position);
        effect.setAttribute('visible', true);
        
        // Configurar cor baseada na superfície
        const color = surface === 'player' ? '#ff0000' : '#888888';
        effect.setAttribute('material', 'color', color);
        
        // Animar partículas
        effect.setAttribute('animation', {
            property: 'scale',
            from: '0.1 0.1 0.1',
            to: '1 1 1',
            dur: 200,
            easing: 'easeOutQuad'
        });

        // Criar partículas de sangue/faíscas
        this.createParticleSystem(position, surface);

        // Esconder após animação
        setTimeout(() => {
            effect.setAttribute('visible', false);
            this.returnToPool('hitEffect', effect);
        }, 500);

        // Reproduzir som de hit
        this.playSound('hit-marker', position, 0.6);
    }

    createHitEffectElement() {
        const entity = document.createElement('a-entity');
        entity.setAttribute('geometry', {
            primitive: 'sphere',
            radius: 0.05
        });
        entity.setAttribute('material', {
            color: '#ff0000',
            emissive: '#ff0000',
            shader: 'standard'
        });
        return entity;
    }

    // Sistema de partículas
    createParticleSystem(position, type = 'blood') {
        if (this.currentParticleCount >= this.maxParticles) {
            return; // Limite de partículas atingido
        }

        const particleCount = type === 'blood' ? 8 : 12;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('a-entity');
            
            // Posição inicial com pequena variação
            const offsetX = (Math.random() - 0.5) * 0.2;
            const offsetY = (Math.random() - 0.5) * 0.2;
            const offsetZ = (Math.random() - 0.5) * 0.2;
            
            particle.setAttribute('position', {
                x: position.x + offsetX,
                y: position.y + offsetY,
                z: position.z + offsetZ
            });

            // Configurar aparência
            if (type === 'blood') {
                particle.setAttribute('geometry', {
                    primitive: 'sphere',
                    radius: 0.02
                });
                particle.setAttribute('material', {
                    color: '#8B0000',
                    shader: 'standard'
                });
            } else {
                particle.setAttribute('geometry', {
                    primitive: 'box',
                    width: 0.01,
                    height: 0.01,
                    depth: 0.01
                });
                particle.setAttribute('material', {
                    color: '#ffaa00',
                    emissive: '#ffaa00',
                    shader: 'standard'
                });
            }

            // Animação de movimento
            const endX = position.x + (Math.random() - 0.5) * 2;
            const endY = position.y - Math.random() * 1;
            const endZ = position.z + (Math.random() - 0.5) * 2;

            particle.setAttribute('animation', {
                property: 'position',
                to: `${endX} ${endY} ${endZ}`,
                dur: 1000,
                easing: 'easeOutQuad'
            });

            // Animação de fade out
            particle.setAttribute('animation__fade', {
                property: 'material.opacity',
                from: 1,
                to: 0,
                dur: 1000,
                easing: 'easeOutQuad'
            });

            this.scene.appendChild(particle);
            particles.push(particle);
            this.currentParticleCount++;

            // Remover partícula após animação
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                    this.currentParticleCount--;
                }
            }, 1000);
        }
    }

    // Efeito de dano na tela (para VR)
    createDamageEffect(intensity = 0.5) {
        const camera = document.querySelector('[camera]');
        if (!camera) return;

        // Criar overlay de dano
        const damageOverlay = document.createElement('a-entity');
        damageOverlay.setAttribute('geometry', {
            primitive: 'sphere',
            radius: 0.1
        });
        damageOverlay.setAttribute('material', {
            color: '#ff0000',
            opacity: intensity * 0.3,
            transparent: true,
            shader: 'standard'
        });
        damageOverlay.setAttribute('position', '0 0 -0.2');

        camera.appendChild(damageOverlay);

        // Animar fade out
        damageOverlay.setAttribute('animation', {
            property: 'material.opacity',
            from: intensity * 0.3,
            to: 0,
            dur: 500,
            easing: 'easeOutQuad'
        });

        // Remover após animação
        setTimeout(() => {
            if (damageOverlay.parentNode) {
                damageOverlay.parentNode.removeChild(damageOverlay);
            }
        }, 500);

        // Vibração háptica se disponível
        this.triggerHapticFeedback(intensity);
    }

    // Feedback háptico para controladores VR
    triggerHapticFeedback(intensity = 0.5, duration = 100) {
        const controllers = document.querySelectorAll('[hand-controls]');
        
        controllers.forEach(controller => {
            const gamepad = controller.components['hand-controls']?.gamepad;
            if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
                gamepad.hapticActuators[0].pulse(intensity, duration);
            }
        });
    }

    // Efeito de recarregamento
    createReloadEffect(weaponEntity) {
        // Som de recarregamento
        const position = weaponEntity.getAttribute('position');
        this.playSound('reload', position, 0.7);

        // Efeito visual de recarregamento
        const reloadIndicator = document.createElement('a-entity');
        reloadIndicator.setAttribute('text', {
            value: 'RECARREGANDO...',
            color: '#ffff00',
            align: 'center',
            width: 6
        });
        reloadIndicator.setAttribute('position', '0 0.5 0');
        reloadIndicator.setAttribute('billboard', '');

        weaponEntity.appendChild(reloadIndicator);

        // Animar texto
        reloadIndicator.setAttribute('animation', {
            property: 'scale',
            from: '0 0 0',
            to: '1 1 1',
            dur: 200,
            easing: 'easeOutBack'
        });

        // Remover após tempo de reload
        const reloadTime = getWeaponConfig(weaponEntity.weaponType)?.reloadTime || 2000;
        setTimeout(() => {
            if (reloadIndicator.parentNode) {
                reloadIndicator.parentNode.removeChild(reloadIndicator);
            }
        }, reloadTime);
    }

    // Efeito de kill feed
    createKillFeedEffect(killerName, victimName, weaponType) {
        const killFeed = document.querySelector('#kill-feed');
        if (!killFeed) return;

        const killEntry = document.createElement('div');
        killEntry.className = 'kill-entry';
        killEntry.innerHTML = `
            <span class="killer">${killerName}</span>
            <span class="weapon">[${weaponType}]</span>
            <span class="victim">${victimName}</span>
        `;

        killFeed.appendChild(killEntry);

        // Animar entrada
        killEntry.style.opacity = '0';
        killEntry.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            killEntry.style.transition = 'all 0.3s ease';
            killEntry.style.opacity = '1';
            killEntry.style.transform = 'translateX(0)';
        }, 10);

        // Remover após 5 segundos
        setTimeout(() => {
            killEntry.style.transition = 'all 0.3s ease';
            killEntry.style.opacity = '0';
            killEntry.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                if (killEntry.parentNode) {
                    killEntry.parentNode.removeChild(killEntry);
                }
            }, 300);
        }, 5000);
    }

    // Gerenciamento de pool de efeitos
    getPooledEffect(type) {
        const pool = this.effectsPool.get(type);
        if (pool && pool.length > 0) {
            return pool.pop();
        }
        return null;
    }

    returnToPool(type, effect) {
        const pool = this.effectsPool.get(type);
        if (pool) {
            pool.push(effect);
        }
    }

    // Limpeza de recursos
    cleanup() {
        this.stopAllSounds();
        
        // Limpar pools de efeitos
        for (const [type, pool] of this.effectsPool) {
            pool.forEach(effect => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            });
            pool.length = 0;
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        console.log('🧹 EffectsManager limpo');
    }
}

// Componente A-Frame para integração
AFRAME.registerComponent('effects-manager', {
    init: function() {
        this.effectsManager = new EffectsManager();
        
        // Disponibilizar globalmente
        this.el.sceneEl.effectsManager = this.effectsManager;
    },

    remove: function() {
        if (this.effectsManager) {
            this.effectsManager.cleanup();
        }
    }
});

// Componente para efeitos de projétil
AFRAME.registerComponent('projectile-effects', {
    schema: {
        weaponType: { type: 'string', default: 'pistol' },
        trailEnabled: { type: 'boolean', default: true },
        trailColor: { type: 'string', default: '#ffaa00' }
    },

    init: function() {
        this.effectsManager = this.el.sceneEl.effectsManager;
        
        if (this.data.trailEnabled) {
            this.createTrail();
        }
    },

    createTrail: function() {
        const trail = document.createElement('a-entity');
        trail.setAttribute('geometry', {
            primitive: 'cylinder',
            radius: 0.005,
            height: 0.5
        });
        trail.setAttribute('material', {
            color: this.data.trailColor,
            emissive: this.data.trailColor,
            opacity: 0.7,
            transparent: true
        });
        trail.setAttribute('position', '0 0 -0.25');
        
        this.el.appendChild(trail);
        this.trail = trail;
    },

    tick: function() {
        // Atualizar trail se necessário
        if (this.trail) {
            try {
                // Fade out gradual
                const material = this.trail.getAttribute('material');
                if (material && typeof material === 'object') {
                    const currentOpacity = material.opacity;
                    if (currentOpacity > 0) {
                        this.trail.setAttribute('material', 'opacity', currentOpacity * 0.95);
                    }
                }
            } catch (error) {
                console.warn('Erro ao atualizar material do trail:', error);
            }
        }
    }
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.EffectsManager = EffectsManager;
}