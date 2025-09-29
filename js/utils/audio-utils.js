/**
 * Audio Utilities - Utilitários de áudio para o jogo
 * 
 * Gerencia todos os aspectos de áudio:
 * - Efeitos sonoros espaciais
 * - Música de fundo
 * - Controle de volume
 * - Áudio 3D para AR/VR
 */

class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.masterVolume = 1.0;
        this.effectsVolume = 0.8;
        this.musicVolume = 0.5;
        this.spatialAudio = true;
        this.currentMusic = null;
        this.audioContext = null;
        this.listener = null;
        
        this.init();
    }

    /**
     * Inicializa o sistema de áudio
     */
    init() {
        console.log('🔊 Inicializando Audio Manager...');
        
        try {
            // Criar contexto de áudio se disponível
            if (window.AudioContext || window.webkitAudioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.listener = this.audioContext.listener;
                console.log('✅ Contexto de áudio criado');
            }

            // Configurar áudio espacial para AR/VR
            this.setupSpatialAudio();
            
            // Carregar sons padrão
            this.loadDefaultSounds();
            
        } catch (error) {
            console.warn('⚠️ Erro ao inicializar áudio:', error);
        }
    }

    /**
     * Configura áudio espacial para AR/VR
     */
    setupSpatialAudio() {
        if (!this.listener) return;

        try {
            // Configurar orientação do listener (câmera/usuário)
            if (this.listener.forwardX) {
                // Web Audio API moderna
                this.listener.forwardX.value = 0;
                this.listener.forwardY.value = 0;
                this.listener.forwardZ.value = -1;
                this.listener.upX.value = 0;
                this.listener.upY.value = 1;
                this.listener.upZ.value = 0;
            } else if (this.listener.setOrientation) {
                // Web Audio API legada
                this.listener.setOrientation(0, 0, -1, 0, 1, 0);
            }

            console.log('✅ Áudio espacial configurado');
        } catch (error) {
            console.warn('⚠️ Erro ao configurar áudio espacial:', error);
        }
    }

    /**
     * Carrega sons padrão do jogo
     */
    loadDefaultSounds() {
        const defaultSounds = {
            shoot: 'assets/sounds/pistol-shot.wav',
            hit: 'assets/audio/hit.wav',
            reload: 'assets/audio/reload.wav',
            pickup: 'assets/audio/pickup.wav',
            explosion: 'assets/audio/explosion.wav',
            footstep: 'assets/audio/footstep.wav',
            ambient: 'assets/sounds/ambient.wav'
        };

        Object.entries(defaultSounds).forEach(([name, url]) => {
            this.loadSound(name, url);
        });
    }

    /**
     * Carrega um som
     */
        /**
     * Carrega um som usando Web Audio API
     */
    async loadSound(name, url, options = {}) {
        try {
            console.log(`🔊 Carregando som: ${name} de ${url}`);
            
            // Usar fetch + decodeAudioData para melhor compatibilidade
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            // Verificar se temos contexto de áudio
            if (!this.audioContext) {
                console.warn(`⚠️ Contexto de áudio não disponível para ${name}`);
                return;
            }
            
            // Decodificar dados de áudio
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Armazenar buffer de áudio
            this.sounds.set(name, {
                buffer: audioBuffer,
                options: options,
                isLoaded: true
            });
            
            console.log(`✅ Som carregado: ${name} (${audioBuffer.duration.toFixed(2)}s)`);
            
        } catch (error) {
            console.warn(`⚠️ Erro ao carregar som ${name}:`, error);
            
            // Fallback: tentar com Audio() tradicional
            try {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audio.volume = options.volume || this.effectsVolume;
                audio.loop = options.loop || false;
                
                this.sounds.set(name, {
                    audio: audio,
                    options: options,
                    isLoaded: false,
                    isFallback: true
                });
                
                // Aguardar carregamento
                await new Promise((resolve) => {
                    audio.addEventListener('canplaythrough', () => {
                        this.sounds.get(name).isLoaded = true;
                        console.log(`✅ Som carregado (fallback): ${name}`);
                        resolve();
                    });
                    
                    audio.addEventListener('error', (e) => {
                        console.warn(`⚠️ Erro no fallback para ${name}:`, e);
                        resolve();
                    });
                    
                    setTimeout(() => {
                        console.warn(`⚠️ Timeout no fallback para: ${name}`);
                        resolve();
                    }, 5000);
                });
                
            } catch (fallbackError) {
                console.error(`❌ Falha completa ao carregar ${name}:`, fallbackError);
            }
        }
    }

    /**
     * Reproduz um som
     */
        /**
     * Reproduz um som
     */
    playSound(name, options = {}) {
        const soundData = this.sounds.get(name);
        if (!soundData || !soundData.isLoaded) {
            console.warn(`⚠️ Som não encontrado ou não carregado: ${name}`);
            return null;
        }

        try {
            // Se é um buffer de áudio (Web Audio API)
            if (soundData.buffer && this.audioContext) {
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = soundData.buffer;
                
                // Configurar volume
                const volume = (options.volume || soundData.options.volume || this.effectsVolume) * this.masterVolume;
                gainNode.gain.value = volume;
                
                // Configurar áudio espacial se necessário
                if (options.position && this.spatialAudio) {
                    const panner = this.audioContext.createPanner();
                    panner.panningModel = 'HRTF';
                    panner.distanceModel = 'inverse';
                    panner.refDistance = 1;
                    panner.maxDistance = 10000;
                    panner.rolloffFactor = 1;
                    
                    // Definir posição
                    if (panner.positionX) {
                        panner.positionX.value = options.position.x || 0;
                        panner.positionY.value = options.position.y || 0;
                        panner.positionZ.value = options.position.z || 0;
                    }
                    
                    source.connect(gainNode);
                    gainNode.connect(panner);
                    panner.connect(this.audioContext.destination);
                } else {
                    source.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                }
                
                // Configurar loop se necessário
                source.loop = options.loop || soundData.options.loop || false;
                
                // Iniciar reprodução
                source.start(0);
                
                return source;
                
            } 
            // Fallback para Audio() tradicional
            else if (soundData.audio) {
                const audio = soundData.audio.cloneNode();
                audio.volume = (options.volume || soundData.options.volume || this.effectsVolume) * this.masterVolume;
                
                audio.play().catch(e => {
                    console.warn(`⚠️ Erro ao reproduzir som ${name}:`, e);
                });
                
                return audio;
            }

        } catch (error) {
            console.warn(`⚠️ Erro ao reproduzir som ${name}:`, error);
            return null;
        }
    }

    /**
     * Define posição 3D de um som
     */
    setSoundPosition(audio, position) {
        if (!audio.spatialNode) return;

        try {
            if (audio.spatialNode.positionX) {
                // Web Audio API moderna
                audio.spatialNode.positionX.value = position.x;
                audio.spatialNode.positionY.value = position.y;
                audio.spatialNode.positionZ.value = position.z;
            } else if (audio.spatialNode.setPosition) {
                // Web Audio API legada
                audio.spatialNode.setPosition(position.x, position.y, position.z);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao definir posição do som:', error);
        }
    }

    /**
     * Atualiza posição do listener (câmera/usuário)
     */
    updateListenerPosition(position, orientation) {
        if (!this.listener) return;

        try {
            // Atualizar posição
            if (this.listener.positionX) {
                this.listener.positionX.value = position.x;
                this.listener.positionY.value = position.y;
                this.listener.positionZ.value = position.z;
            } else if (this.listener.setPosition) {
                this.listener.setPosition(position.x, position.y, position.z);
            }

            // Atualizar orientação se fornecida
            if (orientation) {
                if (this.listener.forwardX) {
                    this.listener.forwardX.value = orientation.forward.x;
                    this.listener.forwardY.value = orientation.forward.y;
                    this.listener.forwardZ.value = orientation.forward.z;
                    this.listener.upX.value = orientation.up.x;
                    this.listener.upY.value = orientation.up.y;
                    this.listener.upZ.value = orientation.up.z;
                } else if (this.listener.setOrientation) {
                    this.listener.setOrientation(
                        orientation.forward.x, orientation.forward.y, orientation.forward.z,
                        orientation.up.x, orientation.up.y, orientation.up.z
                    );
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao atualizar posição do listener:', error);
        }
    }

    /**
     * Reproduz música de fundo
     */
    playMusic(name, options = {}) {
        // Parar música atual se houver
        if (this.currentMusic) {
            this.stopMusic();
        }

        const music = this.musicTracks.get(name);
        if (!music) {
            console.warn(`⚠️ Música não encontrada: ${name}`);
            return;
        }

        try {
            music.volume = (options.volume || this.musicVolume) * this.masterVolume;
            music.loop = options.loop !== false; // Loop por padrão
            music.currentTime = options.startTime || 0;
            
            music.play().then(() => {
                this.currentMusic = music;
                console.log(`🎵 Música iniciada: ${name}`);
            }).catch(e => {
                console.warn(`⚠️ Erro ao reproduzir música ${name}:`, e);
            });

        } catch (error) {
            console.warn(`⚠️ Erro ao reproduzir música ${name}:`, error);
        }
    }

    /**
     * Para a música atual
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            console.log('🎵 Música parada');
        }
    }

    /**
     * Pausa/resume música
     */
    toggleMusic() {
        if (this.currentMusic) {
            if (this.currentMusic.paused) {
                this.currentMusic.play();
                console.log('🎵 Música resumida');
            } else {
                this.currentMusic.pause();
                console.log('🎵 Música pausada');
            }
        }
    }

    /**
     * Define volume master
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Atualizar volume de todos os sons ativos
        this.sounds.forEach(soundData => {
            if (soundData.audio && !soundData.audio.paused) {
                soundData.audio.volume = soundData.options.volume * this.masterVolume;
            }
        });

        // Atualizar volume da música
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }

        console.log(`🔊 Volume master: ${Math.round(this.masterVolume * 100)}%`);
    }

    /**
     * Define volume dos efeitos
     */
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Volume efeitos: ${Math.round(this.effectsVolume * 100)}%`);
    }

    /**
     * Define volume da música
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }

        console.log(`🎵 Volume música: ${Math.round(this.musicVolume * 100)}%`);
    }

    /**
     * Ativa/desativa áudio espacial
     */
    setSpatialAudio(enabled) {
        this.spatialAudio = enabled;
        console.log(`🔊 Áudio espacial: ${enabled ? 'ativado' : 'desativado'}`);
    }

    /**
     * Para todos os sons
     */
    stopAllSounds() {
        this.sounds.forEach(soundData => {
            if (soundData.audio && !soundData.audio.paused) {
                soundData.audio.pause();
                soundData.audio.currentTime = 0;
            }
        });
        
        this.stopMusic();
        console.log('🔇 Todos os sons parados');
    }

    /**
     * Obtém informações de áudio
     */
    getAudioInfo() {
        return {
            masterVolume: this.masterVolume,
            effectsVolume: this.effectsVolume,
            musicVolume: this.musicVolume,
            spatialAudio: this.spatialAudio,
            soundsLoaded: Array.from(this.sounds.keys()),
            musicTracks: Array.from(this.musicTracks.keys()),
            currentMusic: this.currentMusic ? 'playing' : 'none',
            audioContext: !!this.audioContext
        };
    }
}

// Utilitários de áudio para A-Frame
const AFrameAudioUtils = {
    /**
     * Adiciona som a uma entidade A-Frame
     */
    addSoundToEntity(entity, soundName, options = {}) {
        const soundComponent = {
            src: options.src || `#${soundName}`,
            volume: options.volume || 0.8,
            autoplay: options.autoplay || false,
            loop: options.loop || false,
            positional: options.positional !== false,
            poolSize: options.poolSize || 1,
            distanceModel: options.distanceModel || 'inverse',
            maxDistance: options.maxDistance || 10000,
            refDistance: options.refDistance || 1,
            rolloffFactor: options.rolloffFactor || 1
        };

        entity.setAttribute('sound', soundComponent);
        return entity;
    },

    /**
     * Reproduz som em uma entidade
     */
    playEntitySound(entity, soundName) {
        if (entity.components.sound) {
            entity.components.sound.playSound();
        }
    },

    /**
     * Para som em uma entidade
     */
    stopEntitySound(entity) {
        if (entity.components.sound) {
            entity.components.sound.stopSound();
        }
    }
};

// Instância global do gerenciador de áudio
window.audioManager = new AudioManager();
window.AFrameAudioUtils = AFrameAudioUtils;

// Configurar áudio baseado nas configurações AR
document.addEventListener('DOMContentLoaded', () => {
    if (window.AR_CONFIG && window.AR_CONFIG.audio) {
        const config = window.AR_CONFIG.audio;
        
        window.audioManager.setMasterVolume(config.masterVolume);
        window.audioManager.setEffectsVolume(config.effectsVolume);
        window.audioManager.setMusicVolume(config.musicVolume);
        window.audioManager.setSpatialAudio(config.spatialAudio);
    }
});

console.log('🔊 Audio Utilities carregado');