/**
 * VR HUD Component - Interface de usuário para VR/AR
 * 
 * Gerencia a interface do usuário em realidade virtual/aumentada:
 * - HUD com informações do jogo
 * - Menus em 3D
 * - Indicadores visuais
 * - Feedback para o jogador
 */

AFRAME.registerComponent('vr-hud', {
    schema: {
        enabled: { type: 'boolean', default: true },
        opacity: { type: 'number', default: 0.8 },
        distance: { type: 'number', default: 2.5 },
        scale: { type: 'number', default: 1.0 },
        followCamera: { type: 'boolean', default: true },
        showHealth: { type: 'boolean', default: true },
        showAmmo: { type: 'boolean', default: true },
        showScore: { type: 'boolean', default: true },
        showMinimap: { type: 'boolean', default: false }
    },

    init: function() {
        console.log('🎮 Inicializando VR HUD...');
        
        this.camera = null;
        this.hudContainer = null;
        this.elements = {};
        this.isVisible = true;
        this.updateInterval = null;
        
        // Aguardar cena estar pronta
        if (this.el.sceneEl.hasLoaded) {
            this.setupHUD();
        } else {
            this.el.sceneEl.addEventListener('loaded', () => {
                this.setupHUD();
            });
        }
    },

    setupHUD: function() {
        console.log('🎮 Configurando HUD...');
        
        // Encontrar câmera
        this.camera = this.el.sceneEl.querySelector('[camera]') || 
                     this.el.sceneEl.querySelector('a-camera') ||
                     this.el.sceneEl.camera;

        if (!this.camera) {
            console.warn('⚠️ Câmera não encontrada para HUD');
            return;
        }

        // Criar container do HUD
        this.createHUDContainer();
        
        // Criar elementos do HUD
        this.createHUDElements();
        
        // Configurar posicionamento
        this.setupPositioning();
        
        // Iniciar atualizações
        this.startUpdates();
        
        console.log('✅ HUD configurado');
    },

    createHUDContainer: function() {
        this.hudContainer = document.createElement('a-entity');
        this.hudContainer.setAttribute('id', 'vr-hud-container');
        this.hudContainer.setAttribute('visible', this.data.enabled);
        
        // Adicionar à câmera ou cena
        if (this.data.followCamera && this.camera) {
            this.camera.appendChild(this.hudContainer);
        } else {
            this.el.sceneEl.appendChild(this.hudContainer);
        }
    },

    createHUDElements: function() {
        const config = window.AR_CONFIG?.visual?.ui || {};
        
        // Painel principal do HUD
        this.elements.mainPanel = this.createPanel({
            id: 'hud-main-panel',
            position: '0 0.5 -2.5',
            width: 3,
            height: 1,
            color: config.backgroundColor || '#000000',
            opacity: this.data.opacity
        });

        // Indicador de vida
        if (this.data.showHealth) {
            this.elements.healthBar = this.createHealthBar();
        }

        // Indicador de munição
        if (this.data.showAmmo) {
            this.elements.ammoCounter = this.createAmmoCounter();
        }

        // Indicador de pontuação
        if (this.data.showScore) {
            this.elements.scoreDisplay = this.createScoreDisplay();
        }

        // Crosshair central
        this.elements.crosshair = this.createCrosshair();

        // Indicadores de status
        this.elements.statusIndicators = this.createStatusIndicators();

        // Minimapa (se habilitado)
        if (this.data.showMinimap) {
            this.elements.minimap = this.createMinimap();
        }
    },

    createPanel: function(options) {
        const panel = document.createElement('a-plane');
        panel.setAttribute('id', options.id);
        panel.setAttribute('position', options.position);
        panel.setAttribute('width', options.width);
        panel.setAttribute('height', options.height);
        panel.setAttribute('material', {
            color: options.color,
            transparent: true,
            opacity: options.opacity || this.data.opacity
        });
        panel.setAttribute('geometry', {
            primitive: 'plane'
        });

        this.hudContainer.appendChild(panel);
        return panel;
    },

    createHealthBar: function() {
        const container = document.createElement('a-entity');
        container.setAttribute('id', 'health-container');
        container.setAttribute('position', '-1.2 0.3 0.01');

        // Fundo da barra de vida
        const background = document.createElement('a-plane');
        background.setAttribute('width', '0.8');
        background.setAttribute('height', '0.1');
        background.setAttribute('material', {
            color: '#333333',
            transparent: true,
            opacity: 0.8
        });
        container.appendChild(background);

        // Barra de vida
        const healthBar = document.createElement('a-plane');
        healthBar.setAttribute('id', 'health-bar');
        healthBar.setAttribute('width', '0.8');
        healthBar.setAttribute('height', '0.1');
        healthBar.setAttribute('position', '0 0 0.001');
        healthBar.setAttribute('material', {
            color: '#00FF00',
            transparent: true,
            opacity: 0.9
        });
        container.appendChild(healthBar);

        // Texto de vida
        const healthText = document.createElement('a-text');
        healthText.setAttribute('id', 'health-text');
        healthText.setAttribute('value', 'VIDA: 100%');
        healthText.setAttribute('position', '0 -0.15 0.001');
        healthText.setAttribute('align', 'center');
        healthText.setAttribute('width', '6');
        healthText.setAttribute('color', '#FFFFFF');
        container.appendChild(healthText);

        this.elements.mainPanel.appendChild(container);
        return container;
    },

    createAmmoCounter: function() {
        const container = document.createElement('a-entity');
        container.setAttribute('id', 'ammo-container');
        container.setAttribute('position', '1.2 0.3 0.01');

        // Texto de munição
        const ammoText = document.createElement('a-text');
        ammoText.setAttribute('id', 'ammo-text');
        ammoText.setAttribute('value', 'MUNIÇÃO\n30 / 120');
        ammoText.setAttribute('position', '0 0 0');
        ammoText.setAttribute('align', 'center');
        ammoText.setAttribute('width', '6');
        ammoText.setAttribute('color', '#FFFFFF');
        container.appendChild(ammoText);

        // Indicador de recarga
        const reloadIndicator = document.createElement('a-ring');
        reloadIndicator.setAttribute('id', 'reload-indicator');
        reloadIndicator.setAttribute('radius-inner', '0.08');
        reloadIndicator.setAttribute('radius-outer', '0.12');
        reloadIndicator.setAttribute('position', '0 -0.2 0.001');
        reloadIndicator.setAttribute('material', {
            color: '#FFFF00',
            transparent: true,
            opacity: 0
        });
        reloadIndicator.setAttribute('visible', false);
        container.appendChild(reloadIndicator);

        this.elements.mainPanel.appendChild(container);
        return container;
    },

    createScoreDisplay: function() {
        const scoreText = document.createElement('a-text');
        scoreText.setAttribute('id', 'score-text');
        scoreText.setAttribute('value', 'PONTOS: 0');
        scoreText.setAttribute('position', '0 0.7 0.01');
        scoreText.setAttribute('align', 'center');
        scoreText.setAttribute('width', '8');
        scoreText.setAttribute('color', '#FFFF00');

        this.elements.mainPanel.appendChild(scoreText);
        return scoreText;
    },

    createCrosshair: function() {
        const crosshair = document.createElement('a-entity');
        crosshair.setAttribute('id', 'vr-crosshair');
        crosshair.setAttribute('position', '0 0 -1.5');

        // Cruz central
        const horizontal = document.createElement('a-plane');
        horizontal.setAttribute('width', '0.02');
        horizontal.setAttribute('height', '0.002');
        horizontal.setAttribute('material', {
            color: '#00FF00',
            transparent: true,
            opacity: 0.8
        });
        crosshair.appendChild(horizontal);

        const vertical = document.createElement('a-plane');
        vertical.setAttribute('width', '0.002');
        vertical.setAttribute('height', '0.02');
        vertical.setAttribute('material', {
            color: '#00FF00',
            transparent: true,
            opacity: 0.8
        });
        crosshair.appendChild(vertical);

        // Adicionar diretamente à câmera para seguir o olhar
        if (this.camera) {
            this.camera.appendChild(crosshair);
        }

        return crosshair;
    },

    createStatusIndicators: function() {
        const container = document.createElement('a-entity');
        container.setAttribute('id', 'status-indicators');
        container.setAttribute('position', '0 -0.3 0.01');

        // Indicador de conexão
        const connectionIndicator = document.createElement('a-circle');
        connectionIndicator.setAttribute('id', 'connection-indicator');
        connectionIndicator.setAttribute('radius', '0.03');
        connectionIndicator.setAttribute('position', '-0.5 0 0');
        connectionIndicator.setAttribute('material', {
            color: '#00FF00',
            transparent: true,
            opacity: 0.8
        });
        container.appendChild(connectionIndicator);

        // Indicador de FPS
        const fpsText = document.createElement('a-text');
        fpsText.setAttribute('id', 'fps-text');
        fpsText.setAttribute('value', 'FPS: 60');
        fpsText.setAttribute('position', '0.5 0 0');
        fpsText.setAttribute('align', 'center');
        fpsText.setAttribute('width', '4');
        fpsText.setAttribute('color', '#FFFFFF');
        container.appendChild(fpsText);

        this.elements.mainPanel.appendChild(container);
        return container;
    },

    createMinimap: function() {
        const minimap = document.createElement('a-plane');
        minimap.setAttribute('id', 'minimap');
        minimap.setAttribute('position', '1.8 0.8 0.01');
        minimap.setAttribute('width', '0.6');
        minimap.setAttribute('height', '0.6');
        minimap.setAttribute('material', {
            color: '#000000',
            transparent: true,
            opacity: 0.7
        });

        // Adicionar borda
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '0.3');
        border.setAttribute('radius-outer', '0.32');
        border.setAttribute('position', '0 0 0.001');
        border.setAttribute('material', {
            color: '#FFFFFF',
            transparent: true,
            opacity: 0.8
        });
        minimap.appendChild(border);

        this.hudContainer.appendChild(minimap);
        return minimap;
    },

    setupPositioning: function() {
        if (!this.hudContainer) return;

        // Configurar posição e escala baseada nas configurações
        this.hudContainer.setAttribute('position', `0 0 -${this.data.distance}`);
        this.hudContainer.setAttribute('scale', `${this.data.scale} ${this.data.scale} ${this.data.scale}`);

        // Configurar para AR se necessário
        if (window.AR_CONFIG && this.isARMode()) {
            this.configureForAR();
        }
    },

    configureForAR: function() {
        const arConfig = window.AR_CONFIG.visual.ui;
        
        // Ajustar opacidade para AR
        this.hudContainer.setAttribute('scale', `${arConfig.hudScale} ${arConfig.hudScale} ${arConfig.hudScale}`);
        
        // Tornar elementos mais transparentes
        const panels = this.hudContainer.querySelectorAll('[material]');
        panels.forEach(panel => {
            try {
                // Aguardar elemento estar totalmente carregado
                if (!panel.hasLoaded) {
                    panel.addEventListener('loaded', () => {
                        this.updatePanelMaterial(panel, arConfig.hudOpacity);
                    });
                } else {
                    this.updatePanelMaterial(panel, arConfig.hudOpacity);
                }
            } catch (error) {
                console.warn('Erro ao atualizar material do painel:', error);
            }
        });
    },

    updatePanelMaterial: function(panel, opacityMultiplier) {
        try {
            const material = panel.getAttribute('material');
            if (material && typeof material === 'object') {
                material.opacity = (material.opacity || 1.0) * opacityMultiplier;
                panel.setAttribute('material', material);
            }
        } catch (error) {
            console.warn('Erro ao atualizar material:', error);
        }
    },

    startUpdates: function() {
        // Atualizar HUD a cada 100ms
        this.updateInterval = setInterval(() => {
            this.updateHUD();
        }, 100);
    },

    updateHUD: function() {
        if (!this.isVisible || !this.data.enabled) return;

        // Atualizar vida
        this.updateHealth();
        
        // Atualizar munição
        this.updateAmmo();
        
        // Atualizar pontuação
        this.updateScore();
        
        // Atualizar status
        this.updateStatus();
        
        // Atualizar posição se necessário
        if (!this.data.followCamera) {
            this.updatePosition();
        }
    },

    updateHealth: function() {
        const healthText = this.hudContainer.querySelector('#health-text');
        const healthBar = this.hudContainer.querySelector('#health-bar');
        
        if (healthText && healthBar) {
            // Obter vida atual do game manager
            const health = this.getPlayerHealth();
            const healthPercent = Math.max(0, Math.min(100, health));
            
            healthText.setAttribute('value', `VIDA: ${healthPercent}%`);
            
            // Atualizar cor da barra baseada na vida
            let color = '#00FF00'; // Verde
            if (healthPercent < 30) {
                color = '#FF0000'; // Vermelho
            } else if (healthPercent < 60) {
                color = '#FFFF00'; // Amarelo
            }
            
            try {
                const material = healthBar.getAttribute('material');
                if (material && typeof material === 'object') {
                    material.color = color;
                    healthBar.setAttribute('material', material);
                }
            } catch (error) {
                console.warn('Erro ao atualizar material da barra de vida:', error);
            }
            
            // Atualizar largura da barra
            healthBar.setAttribute('width', 0.8 * (healthPercent / 100));
        }
    },

    updateAmmo: function() {
        const ammoText = this.hudContainer.querySelector('#ammo-text');
        
        if (ammoText) {
            const ammoData = this.getPlayerAmmo();
            ammoText.setAttribute('value', `MUNIÇÃO\n${ammoData.current} / ${ammoData.total}`);
            
            // Mostrar indicador de recarga se necessário
            const reloadIndicator = this.hudContainer.querySelector('#reload-indicator');
            if (reloadIndicator && ammoData.reloading) {
                reloadIndicator.setAttribute('visible', true);
                reloadIndicator.setAttribute('material', { opacity: 0.8 });
            } else if (reloadIndicator) {
                reloadIndicator.setAttribute('visible', false);
            }
        }
    },

    updateScore: function() {
        const scoreText = this.hudContainer.querySelector('#score-text');
        
        if (scoreText) {
            const score = this.getPlayerScore();
            scoreText.setAttribute('value', `PONTOS: ${score}`);
        }
    },

    updateStatus: function() {
        // Atualizar indicador de conexão
        const connectionIndicator = this.hudContainer.querySelector('#connection-indicator');
        if (connectionIndicator) {
            const isConnected = this.isNetworkConnected();
            try {
                const material = connectionIndicator.getAttribute('material');
                if (material && typeof material === 'object') {
                    material.color = isConnected ? '#00FF00' : '#FF0000';
                    connectionIndicator.setAttribute('material', material);
                }
            } catch (error) {
                console.warn('Erro ao atualizar material do indicador de conexão:', error);
            }
        }

        // Atualizar FPS
        const fpsText = this.hudContainer.querySelector('#fps-text');
        if (fpsText) {
            const fps = this.getCurrentFPS();
            fpsText.setAttribute('value', `FPS: ${fps}`);
            
            // Mudar cor baseada no FPS
            let color = '#00FF00'; // Verde para FPS bom
            if (fps < 30) {
                color = '#FF0000'; // Vermelho para FPS baixo
            } else if (fps < 50) {
                color = '#FFFF00'; // Amarelo para FPS médio
            }
            fpsText.setAttribute('color', color);
        }
    },

    updatePosition: function() {
        if (!this.camera || !this.hudContainer) return;

        // Obter posição e rotação da câmera
        const cameraPosition = this.camera.getAttribute('position');
        const cameraRotation = this.camera.getAttribute('rotation');

        // Calcular posição do HUD na frente da câmera
        const distance = this.data.distance;
        const radY = (cameraRotation.y * Math.PI) / 180;
        
        const hudPosition = {
            x: cameraPosition.x + Math.sin(radY) * distance,
            y: cameraPosition.y,
            z: cameraPosition.z - Math.cos(radY) * distance
        };

        this.hudContainer.setAttribute('position', hudPosition);
        this.hudContainer.setAttribute('rotation', `0 ${cameraRotation.y} 0`);
    },

    // Métodos auxiliares para obter dados do jogo
    getPlayerHealth: function() {
        // Integrar com game manager quando disponível
        return 100; // Placeholder
    },

    getPlayerAmmo: function() {
        // Integrar com game manager quando disponível
        return { current: 30, total: 120, reloading: false }; // Placeholder
    },

    getPlayerScore: function() {
        // Integrar com game manager quando disponível
        return 0; // Placeholder
    },

    isNetworkConnected: function() {
        // Verificar conexão de rede
        return navigator.onLine;
    },

    getCurrentFPS: function() {
        // Calcular FPS atual
        if (this.el.sceneEl.renderer && this.el.sceneEl.renderer.info) {
            return Math.round(1000 / this.el.sceneEl.renderer.info.render.frame) || 60;
        }
        return 60; // Placeholder
    },

    isARMode: function() {
        return this.el.sceneEl.is('ar-mode') || 
               (this.el.sceneEl.xrSession && this.el.sceneEl.xrSession.environmentBlendMode === 'additive');
    },

    // Métodos públicos
    show: function() {
        this.isVisible = true;
        if (this.hudContainer) {
            this.hudContainer.setAttribute('visible', true);
        }
    },

    hide: function() {
        this.isVisible = false;
        if (this.hudContainer) {
            this.hudContainer.setAttribute('visible', false);
        }
    },

    toggle: function() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    },

    setOpacity: function(opacity) {
        this.data.opacity = Math.max(0, Math.min(1, opacity));
        
        // Atualizar opacidade de todos os elementos
        const elements = this.hudContainer.querySelectorAll('[material]');
        elements.forEach(element => {
            const material = element.getAttribute('material');
            if (material && typeof material === 'object') {
                material.opacity = this.data.opacity;
                element.setAttribute('material', material);
            }
        });
    },

    remove: function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.hudContainer) {
            this.hudContainer.remove();
        }
    }
});

// Registrar eventos para controle do HUD
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar HUD à cena automaticamente
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('vr-hud', '');
    }

    // Controles de teclado para debug
    document.addEventListener('keydown', (event) => {
        const hudComponent = scene.components['vr-hud'];
        if (!hudComponent) return;

        switch (event.key) {
            case 'h':
            case 'H':
                hudComponent.toggle();
                break;
            case '+':
                hudComponent.setOpacity(hudComponent.data.opacity + 0.1);
                break;
            case '-':
                hudComponent.setOpacity(hudComponent.data.opacity - 0.1);
                break;
        }
    });
});

console.log('🎮 VR HUD Component carregado');