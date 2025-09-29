// Sistema de HUD para VR
AFRAME.registerComponent('vr-hud', {
    schema: {
        health: { type: 'number', default: 100 },
        maxHealth: { type: 'number', default: 100 },
        score: { type: 'number', default: 0 },
        timeLeft: { type: 'number', default: 300 },
        weapon: { type: 'string', default: 'pistol' },
        ammo: { type: 'number', default: 30 },
        maxAmmo: { type: 'number', default: 30 }
    },

    init: function() {
        console.log('🎯 Inicializando VR HUD...');
        
        this.createHealthBar();
        this.createScoreDisplay();
        this.createTimerDisplay();
        this.createWeaponInfo();
        this.createCrosshair();
        this.createMinimap();
        this.createDamageIndicator();
        
        // Atualizar HUD periodicamente
        this.updateInterval = setInterval(() => {
            this.updateHUD();
        }, 100);
    },

    remove: function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    },

    createHealthBar: function() {
        // Container da barra de vida
        const healthContainer = document.createElement('a-entity');
        healthContainer.id = 'healthContainer';
        healthContainer.setAttribute('position', '-2 -1.5 -3');
        
        // Fundo da barra de vida
        const healthBg = document.createElement('a-plane');
        healthBg.setAttribute('width', '2');
        healthBg.setAttribute('height', '0.3');
        healthBg.setAttribute('color', '#333');
        healthBg.setAttribute('opacity', '0.8');
        healthContainer.appendChild(healthBg);
        
        // Barra de vida
        const healthBar = document.createElement('a-plane');
        healthBar.id = 'healthBar';
        healthBar.setAttribute('width', '1.9');
        healthBar.setAttribute('height', '0.25');
        healthBar.setAttribute('color', '#00ff00');
        healthBar.setAttribute('position', '0 0 0.01');
        healthContainer.appendChild(healthBar);
        
        // Texto da vida
        const healthText = document.createElement('a-text');
        healthText.id = 'healthText';
        healthText.setAttribute('value', 'VIDA: 100/100');
        healthText.setAttribute('color', 'white');
        healthText.setAttribute('align', 'center');
        healthText.setAttribute('position', '0 -0.4 0.01');
        healthText.setAttribute('scale', '0.8 0.8 0.8');
        healthContainer.appendChild(healthText);
        
        this.el.appendChild(healthContainer);
    },

    createScoreDisplay: function() {
        // Display de pontuação
        const scoreText = document.createElement('a-text');
        scoreText.id = 'scoreText';
        scoreText.setAttribute('value', 'PONTOS: 0');
        scoreText.setAttribute('color', 'yellow');
        scoreText.setAttribute('align', 'center');
        scoreText.setAttribute('position', '0 1.8 -3');
        scoreText.setAttribute('scale', '1.2 1.2 1.2');
        
        this.el.appendChild(scoreText);
    },

    createTimerDisplay: function() {
        // Display do timer
        const timerText = document.createElement('a-text');
        timerText.id = 'timerText';
        timerText.setAttribute('value', 'TEMPO: 5:00');
        timerText.setAttribute('color', 'white');
        timerText.setAttribute('align', 'center');
        timerText.setAttribute('position', '2 1.8 -3');
        timerText.setAttribute('scale', '1 1 1');
        
        this.el.appendChild(timerText);
    },

    createWeaponInfo: function() {
        // Container de informações da arma
        const weaponContainer = document.createElement('a-entity');
        weaponContainer.id = 'weaponContainer';
        weaponContainer.setAttribute('position', '2 -1.5 -3');
        
        // Nome da arma
        const weaponName = document.createElement('a-text');
        weaponName.id = 'weaponName';
        weaponName.setAttribute('value', 'PISTOLA');
        weaponName.setAttribute('color', 'cyan');
        weaponName.setAttribute('align', 'center');
        weaponName.setAttribute('position', '0 0.3 0');
        weaponName.setAttribute('scale', '0.9 0.9 0.9');
        weaponContainer.appendChild(weaponName);
        
        // Munição
        const ammoText = document.createElement('a-text');
        ammoText.id = 'ammoText';
        ammoText.setAttribute('value', '30/30');
        ammoText.setAttribute('color', 'white');
        ammoText.setAttribute('align', 'center');
        ammoText.setAttribute('position', '0 -0.2 0');
        ammoText.setAttribute('scale', '1.2 1.2 1.2');
        weaponContainer.appendChild(ammoText);
        
        this.el.appendChild(weaponContainer);
    },

    createCrosshair: function() {
        // Mira central
        const crosshair = document.createElement('a-entity');
        crosshair.id = 'crosshair';
        crosshair.setAttribute('position', '0 0 -2');
        
        // Linhas da mira
        const horizontal = document.createElement('a-plane');
        horizontal.setAttribute('width', '0.1');
        horizontal.setAttribute('height', '0.01');
        horizontal.setAttribute('color', 'red');
        horizontal.setAttribute('opacity', '0.8');
        crosshair.appendChild(horizontal);
        
        const vertical = document.createElement('a-plane');
        vertical.setAttribute('width', '0.01');
        vertical.setAttribute('height', '0.1');
        vertical.setAttribute('color', 'red');
        vertical.setAttribute('opacity', '0.8');
        vertical.setAttribute('position', '0 0 0.001');
        crosshair.appendChild(vertical);
        
        // Círculo central
        const center = document.createElement('a-circle');
        center.setAttribute('radius', '0.01');
        center.setAttribute('color', 'red');
        center.setAttribute('opacity', '0.6');
        center.setAttribute('position', '0 0 0.002');
        crosshair.appendChild(center);
        
        this.el.appendChild(crosshair);
    },

    createMinimap: function() {
        // Minimapa
        const minimap = document.createElement('a-entity');
        minimap.id = 'minimap';
        minimap.setAttribute('position', '-2.5 1.5 -3');
        
        // Fundo do minimapa
        const mapBg = document.createElement('a-plane');
        mapBg.setAttribute('width', '1.5');
        mapBg.setAttribute('height', '1.5');
        mapBg.setAttribute('color', '#001122');
        mapBg.setAttribute('opacity', '0.7');
        minimap.appendChild(mapBg);
        
        // Borda do minimapa
        const mapBorder = document.createElement('a-plane');
        mapBorder.setAttribute('width', '1.52');
        mapBorder.setAttribute('height', '1.52');
        mapBorder.setAttribute('color', 'white');
        mapBorder.setAttribute('position', '0 0 -0.001');
        minimap.appendChild(mapBorder);
        
        // Título do minimapa
        const mapTitle = document.createElement('a-text');
        mapTitle.setAttribute('value', 'MAPA');
        mapTitle.setAttribute('color', 'white');
        mapTitle.setAttribute('align', 'center');
        mapTitle.setAttribute('position', '0 0.9 0.01');
        mapTitle.setAttribute('scale', '0.6 0.6 0.6');
        minimap.appendChild(mapTitle);
        
        // Ponto do jogador no minimapa
        const playerDot = document.createElement('a-circle');
        playerDot.id = 'playerDot';
        playerDot.setAttribute('radius', '0.05');
        playerDot.setAttribute('color', 'blue');
        playerDot.setAttribute('position', '0 0 0.01');
        minimap.appendChild(playerDot);
        
        this.el.appendChild(minimap);
    },

    createDamageIndicator: function() {
        // Indicador de dano (tela vermelha)
        const damageOverlay = document.createElement('a-plane');
        damageOverlay.id = 'damageOverlay';
        damageOverlay.setAttribute('width', '10');
        damageOverlay.setAttribute('height', '10');
        damageOverlay.setAttribute('color', 'red');
        damageOverlay.setAttribute('opacity', '0');
        damageOverlay.setAttribute('position', '0 0 -1.5');
        
        this.el.appendChild(damageOverlay);
    },

    updateHUD: function() {
        // Atualizar todos os elementos do HUD
        this.updateHealthBar();
        this.updateCrosshair();
        this.updateMinimap();
    },

    updateHealth: function(health) {
        this.data.health = Math.max(0, Math.min(health, this.data.maxHealth));
        
        const healthBar = document.querySelector('#healthBar');
        const healthText = document.querySelector('#healthText');
        
        if (healthBar && healthText) {
            // Atualizar largura da barra
            const healthPercent = this.data.health / this.data.maxHealth;
            healthBar.setAttribute('width', 1.9 * healthPercent);
            
            // Atualizar cor da barra
            let color = '#00ff00'; // Verde
            if (healthPercent < 0.3) {
                color = '#ff0000'; // Vermelho
            } else if (healthPercent < 0.6) {
                color = '#ffaa00'; // Laranja
            }
            healthBar.setAttribute('color', color);
            
            // Atualizar texto
            healthText.setAttribute('value', `VIDA: ${this.data.health}/${this.data.maxHealth}`);
            
            // Efeito de dano
            if (this.lastHealth && this.data.health < this.lastHealth) {
                this.showDamageEffect();
            }
            
            this.lastHealth = this.data.health;
        }
    },

    updateHealthBar: function() {
        const healthBar = document.querySelector('#healthBar');
        if (healthBar) {
            // Animação suave da barra de vida
            const currentWidth = parseFloat(healthBar.getAttribute('width'));
            const targetWidth = 1.9 * (this.data.health / this.data.maxHealth);
            
            if (Math.abs(currentWidth - targetWidth) > 0.01) {
                const newWidth = currentWidth + (targetWidth - currentWidth) * 0.1;
                healthBar.setAttribute('width', newWidth);
            }
        }
    },

    updateScore: function(score) {
        this.data.score = score;
        
        const scoreText = document.querySelector('#scoreText');
        if (scoreText) {
            scoreText.setAttribute('value', `PONTOS: ${this.data.score}`);
            
            // Efeito de aumento de pontuação
            if (this.lastScore && score > this.lastScore) {
                this.showScoreIncrease(score - this.lastScore);
            }
            
            this.lastScore = score;
        }
    },

    updateWeapon: function(weaponType) {
        this.data.weapon = weaponType;
        
        const weaponName = document.querySelector('#weaponName');
        if (weaponName) {
            const weaponNames = {
                'pistol': 'PISTOLA',
                'sniper': 'SNIPER'
            };
            
            weaponName.setAttribute('value', weaponNames[weaponType] || 'DESCONHECIDA');
            
            // Efeito de mudança de arma
            weaponName.setAttribute('animation', {
                property: 'scale',
                from: '0.9 0.9 0.9',
                to: '1.2 1.2 1.2',
                dur: 300,
                direction: 'alternate',
                loop: 1
            });
        }
    },

    updateAmmo: function(ammo, maxAmmo) {
        this.data.ammo = ammo;
        this.data.maxAmmo = maxAmmo;
        
        const ammoText = document.querySelector('#ammoText');
        if (ammoText) {
            ammoText.setAttribute('value', `${this.data.ammo}/${this.data.maxAmmo}`);
            
            // Mudar cor quando munição está baixa
            if (this.data.ammo <= 5) {
                ammoText.setAttribute('color', 'red');
            } else if (this.data.ammo <= 10) {
                ammoText.setAttribute('color', 'orange');
            } else {
                ammoText.setAttribute('color', 'white');
            }
        }
    },

    updateCrosshair: function() {
        const crosshair = document.querySelector('#crosshair');
        if (crosshair) {
            // Expandir mira quando atirando
            const playerController = document.querySelector('#playerRig')?.components['player-controller'];
            if (playerController && playerController.isShooting) {
                crosshair.setAttribute('scale', '1.5 1.5 1.5');
            } else {
                crosshair.setAttribute('scale', '1 1 1');
            }
        }
    },

    updateMinimap: function() {
        const playerDot = document.querySelector('#playerDot');
        const playerRig = document.querySelector('#playerRig');
        
        if (playerDot && playerRig) {
            const position = playerRig.getAttribute('position');
            
            // Converter posição do mundo para posição do minimapa
            const mapX = (position.x / 20) * 0.7; // Escala do mapa
            const mapZ = (position.z / 20) * 0.7;
            
            playerDot.setAttribute('position', `${mapX} ${-mapZ} 0.01`);
            
            // Rotação do ponto do jogador
            const rotation = playerRig.getAttribute('rotation');
            playerDot.setAttribute('rotation', `0 0 ${-rotation.y}`);
        }
    },

    showDamageEffect: function() {
        const damageOverlay = document.querySelector('#damageOverlay');
        if (damageOverlay) {
            // Efeito de tela vermelha
            damageOverlay.setAttribute('animation', {
                property: 'opacity',
                from: '0.5',
                to: '0',
                dur: 500,
                easing: 'easeOutQuad'
            });
            
            // Vibração da câmera (se suportado)
            const camera = document.querySelector('#playerCamera');
            if (camera && navigator.vibrate) {
                navigator.vibrate(200);
            }
        }
    },

    showScoreIncrease: function(points) {
        // Criar texto flutuante de pontuação
        const scorePopup = document.createElement('a-text');
        scorePopup.setAttribute('value', `+${points}`);
        scorePopup.setAttribute('color', 'yellow');
        scorePopup.setAttribute('align', 'center');
        scorePopup.setAttribute('position', '0.5 1.5 -3');
        scorePopup.setAttribute('scale', '1.5 1.5 1.5');
        
        // Animação de movimento e desaparecimento
        scorePopup.setAttribute('animation', {
            property: 'position',
            from: '0.5 1.5 -3',
            to: '0.5 2.2 -3',
            dur: 1000,
            easing: 'easeOutQuad'
        });
        
        scorePopup.setAttribute('animation__fade', {
            property: 'opacity',
            from: '1',
            to: '0',
            dur: 1000,
            easing: 'easeOutQuad'
        });
        
        this.el.appendChild(scorePopup);
        
        setTimeout(() => {
            if (scorePopup.parentNode) {
                scorePopup.parentNode.removeChild(scorePopup);
            }
        }, 1100);
    },

    showReloadIndicator: function() {
        // Indicador de recarga
        const reloadText = document.createElement('a-text');
        reloadText.setAttribute('value', 'RECARREGANDO...');
        reloadText.setAttribute('color', 'orange');
        reloadText.setAttribute('align', 'center');
        reloadText.setAttribute('position', '0 0.5 -3');
        reloadText.setAttribute('scale', '1 1 1');
        
        // Animação piscante
        reloadText.setAttribute('animation', {
            property: 'opacity',
            from: '1',
            to: '0.3',
            dur: 300,
            direction: 'alternate',
            loop: 6
        });
        
        this.el.appendChild(reloadText);
        
        setTimeout(() => {
            if (reloadText.parentNode) {
                reloadText.parentNode.removeChild(reloadText);
            }
        }, 2000);
    },

    showKillFeed: function(killerName, victimName) {
        // Feed de eliminações
        const killFeed = document.createElement('a-text');
        killFeed.setAttribute('value', `${killerName} eliminou ${victimName}`);
        killFeed.setAttribute('color', 'white');
        killFeed.setAttribute('align', 'left');
        killFeed.setAttribute('position', '-3 0.8 -3');
        killFeed.setAttribute('scale', '0.8 0.8 0.8');
        
        // Animação de entrada
        killFeed.setAttribute('animation', {
            property: 'position',
            from: '-4 0.8 -3',
            to: '-3 0.8 -3',
            dur: 500,
            easing: 'easeOutQuad'
        });
        
        this.el.appendChild(killFeed);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (killFeed.parentNode) {
                killFeed.setAttribute('animation__exit', {
                    property: 'opacity',
                    from: '1',
                    to: '0',
                    dur: 500,
                    easing: 'easeOutQuad'
                });
                
                setTimeout(() => {
                    if (killFeed.parentNode) {
                        killFeed.parentNode.removeChild(killFeed);
                    }
                }, 500);
            }
        }, 3000);
    },

    showPowerUpNotification: function(powerUpType) {
        // Notificação de power-up
        const notification = document.createElement('a-text');
        notification.setAttribute('value', `🔫 ARMA ESPECIAL COLETADA!`);
        notification.setAttribute('color', 'gold');
        notification.setAttribute('align', 'center');
        notification.setAttribute('position', '0 1 -3');
        notification.setAttribute('scale', '1.2 1.2 1.2');
        
        // Animação de entrada
        notification.setAttribute('animation', {
            property: 'scale',
            from: '0 0 0',
            to: '1.2 1.2 1.2',
            dur: 500,
            easing: 'easeOutBounce'
        });
        
        this.el.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2500);
    }
});

// Componente para efeitos visuais do HUD
AFRAME.registerComponent('hud-effects', {
    init: function() {
        this.createMuzzleFlash();
        this.createHitMarker();
    },

    createMuzzleFlash: function() {
        // Flash do tiro
        const muzzleFlash = document.createElement('a-sphere');
        muzzleFlash.id = 'muzzleFlash';
        muzzleFlash.setAttribute('radius', '0.1');
        muzzleFlash.setAttribute('color', 'yellow');
        muzzleFlash.setAttribute('opacity', '0');
        muzzleFlash.setAttribute('position', '0 0 -0.5');
        
        this.el.appendChild(muzzleFlash);
    },

    createHitMarker: function() {
        // Marcador de acerto
        const hitMarker = document.createElement('a-text');
        hitMarker.id = 'hitMarker';
        hitMarker.setAttribute('value', 'X');
        hitMarker.setAttribute('color', 'red');
        hitMarker.setAttribute('align', 'center');
        hitMarker.setAttribute('position', '0 0 -2');
        hitMarker.setAttribute('scale', '2 2 2');
        hitMarker.setAttribute('opacity', '0');
        
        this.el.appendChild(hitMarker);
    },

    showMuzzleFlash: function() {
        const muzzleFlash = document.querySelector('#muzzleFlash');
        if (muzzleFlash) {
            muzzleFlash.setAttribute('animation', {
                property: 'opacity',
                from: '0.8',
                to: '0',
                dur: 100,
                easing: 'easeOutQuad'
            });
        }
    },

    showHitMarker: function() {
        const hitMarker = document.querySelector('#hitMarker');
        if (hitMarker) {
            hitMarker.setAttribute('animation', {
                property: 'opacity',
                from: '1',
                to: '0',
                dur: 200,
                easing: 'easeOutQuad'
            });
            
            hitMarker.setAttribute('animation__scale', {
                property: 'scale',
                from: '1 1 1',
                to: '2 2 2',
                dur: 200,
                easing: 'easeOutQuad'
            });
        }
    }
});