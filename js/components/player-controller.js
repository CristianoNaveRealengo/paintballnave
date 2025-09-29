// Componente de controle do jogador VR
AFRAME.registerComponent('player-controller', {
    schema: {
        speed: { type: 'number', default: 5 },
        jumpHeight: { type: 'number', default: 3 },
        health: { type: 'number', default: 100 },
        team: { type: 'string', default: 'blue' }
    },

    init: function () {
        this.player = {
            id: null,
            health: this.data.health,
            score: 0,
            weapon: 'pistol',
            team: this.data.team,
            isMoving: false,
            lastPosition: { x: 0, y: 0, z: 0 },
            lastRotation: { x: 0, y: 0, z: 0 }
        };

        this.keys = {};
        this.setupEventListeners();
        this.setupVRControls();
        
        console.log('🎮 Player Controller inicializado');
    },

    setupEventListeners: function () {
        // Eventos de teclado para desktop
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyInput(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Eventos de mouse para desktop
        document.addEventListener('click', (e) => {
            if (document.pointerLockElement) {
                this.handleShoot();
            }
        });

        // Eventos VR
        this.el.addEventListener('triggerdown', () => {
            this.handleShoot();
        });

        this.el.addEventListener('gripdown', () => {
            this.handleReload();
        });

        // Eventos de colisão
        this.el.addEventListener('collide', (e) => {
            this.handleCollision(e.detail.target);
        });
    },

    setupVRControls: function () {
        // Configurar controles específicos do Meta Quest 3
        const camera = this.el.querySelector('#playerCamera');
        if (camera) {
            // Configurações de movimento suave
            camera.setAttribute('look-controls', {
                'pointer-lock-enabled': true,
                'touch-enabled': true,
                'magnet-enabled': true
            });

            // Configurações de movimento WASD
            camera.setAttribute('wasd-controls', {
                'acceleration': 20,
                'fly': false,
                'enabled': true
            });
        }
    },

    handleKeyInput: function (event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.handleJump();
                break;
            case 'KeyR':
                this.handleReload();
                break;
            case 'KeyE':
                this.handleInteract();
                break;
            case 'Tab':
                event.preventDefault();
                this.showScoreboard();
                break;
        }
    },

    handleShoot: function () {
        const camera = this.el.querySelector('#playerCamera');
        const weapon = this.el.querySelector('#weapon');
        
        if (!camera || !weapon) return;

        // Obter posição e direção do disparo
        const cameraPosition = camera.getAttribute('position');
        const cameraRotation = camera.getAttribute('rotation');
        
        // Calcular direção baseada na rotação da câmera
        const direction = this.calculateShootDirection(cameraRotation);
        
        // Dados do disparo
        const shootData = {
            position: {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z
            },
            direction: direction,
            weapon: this.player.weapon,
            timestamp: Date.now()
        };

        // Enviar disparo para o servidor
        if (window.networkManager) {
            window.networkManager.shoot(shootData);
        }

        // Efeitos visuais e sonoros locais
        this.createMuzzleFlash();
        this.playShootSound();
        this.addRecoil();

        console.log('🔫 Disparo realizado:', shootData);
    },

    calculateShootDirection: function (rotation) {
        // Converter rotação em radianos
        const pitch = THREE.MathUtils.degToRad(rotation.x);
        const yaw = THREE.MathUtils.degToRad(rotation.y);

        // Calcular vetor de direção
        return {
            x: Math.sin(yaw) * Math.cos(pitch),
            y: -Math.sin(pitch),
            z: -Math.cos(yaw) * Math.cos(pitch)
        };
    },

    createMuzzleFlash: function () {
        const weapon = this.el.querySelector('#weapon');
        if (!weapon) return;

        // Criar flash visual
        const flash = document.createElement('a-sphere');
        flash.setAttribute('radius', '0.1');
        flash.setAttribute('color', '#ffff00');
        flash.setAttribute('position', '0 0 -0.4');
        flash.setAttribute('animation', {
            property: 'scale',
            from: '1 1 1',
            to: '0 0 0',
            dur: 100,
            easing: 'easeOutQuad'
        });

        weapon.appendChild(flash);

        // Remover flash após animação
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 150);
    },

    playShootSound: function () {
        const shootSound = document.querySelector('#shootSound');
        if (shootSound) {
            shootSound.currentTime = 0;
            shootSound.play().catch(e => console.log('Erro ao tocar som:', e));
        }
    },

    addRecoil: function () {
        const camera = this.el.querySelector('#playerCamera');
        if (!camera) return;

        // Adicionar recuo visual
        const currentRotation = camera.getAttribute('rotation');
        const recoilAmount = this.player.weapon === 'sniper' ? 2 : 1;
        
        camera.setAttribute('animation__recoil', {
            property: 'rotation',
            from: `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`,
            to: `${currentRotation.x - recoilAmount} ${currentRotation.y} ${currentRotation.z}`,
            dur: 50,
            dir: 'alternate',
            easing: 'easeOutQuad'
        });
    },

    handleJump: function () {
        const rigidBody = this.el.getAttribute('dynamic-body');
        if (rigidBody) {
            // Aplicar força de pulo
            this.el.body.velocity.y = this.data.jumpHeight;
        }
    },

    handleReload: function () {
        console.log('🔄 Recarregando arma...');
        
        // Tocar som de recarga
        const reloadSound = document.querySelector('#reloadSound');
        if (reloadSound) {
            reloadSound.currentTime = 0;
            reloadSound.play().catch(e => console.log('Erro ao tocar som:', e));
        }

        // Animação de recarga
        const weapon = this.el.querySelector('#weapon');
        if (weapon) {
            weapon.setAttribute('animation__reload', {
                property: 'rotation',
                from: '0 0 0',
                to: '0 0 -30',
                dur: 500,
                dir: 'alternate',
                easing: 'easeInOutQuad'
            });
        }
    },

    handleInteract: function () {
        // Verificar interações próximas (health packs, armas especiais)
        const position = this.el.getAttribute('position');
        
        // Verificar health packs
        const healthPacks = document.querySelectorAll('[health-pack]');
        healthPacks.forEach(pack => {
            const packPosition = pack.getAttribute('position');
            const distance = this.calculateDistance(position, packPosition);
            
            if (distance < 2) {
                this.collectHealthPack(pack);
            }
        });

        // Verificar arma especial
        const specialWeapon = document.querySelector('[special-weapon]');
        if (specialWeapon) {
            const weaponPosition = specialWeapon.getAttribute('position');
            const distance = this.calculateDistance(position, weaponPosition);
            
            if (distance < 2) {
                this.collectSpecialWeapon();
            }
        }
    },

    calculateDistance: function (pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    collectHealthPack: function (pack) {
        if (this.player.health < 100) {
            const packId = pack.id;
            if (window.networkManager) {
                window.networkManager.collectHealthPack(packId);
            }
        }
    },

    collectSpecialWeapon: function () {
        if (window.networkManager) {
            window.networkManager.collectSpecialWeapon();
        }
    },

    handleCollision: function (target) {
        // Verificar se colidiu com projétil inimigo
        if (target.classList.contains('projectile')) {
            const projectileData = target.components.projectile;
            if (projectileData && projectileData.data.playerId !== this.player.id) {
                this.takeDamage(projectileData.data.damage, projectileData.data.playerId);
            }
        }
    },

    takeDamage: function (damage, shooterId) {
        this.player.health = Math.max(0, this.player.health - damage);
        
        // Efeito visual de dano
        this.showDamageEffect();
        
        // Som de acerto
        const hitSound = document.querySelector('#hitSound');
        if (hitSound) {
            hitSound.currentTime = 0;
            hitSound.play().catch(e => console.log('Erro ao tocar som:', e));
        }

        // Notificar servidor
        if (window.networkManager) {
            window.networkManager.reportHit({
                targetId: this.player.id,
                shooterId: shooterId,
                damage: damage
            });
        }

        console.log(`💥 Recebeu ${damage} de dano. Vida: ${this.player.health}`);
    },

    showDamageEffect: function () {
        const camera = this.el.querySelector('#playerCamera');
        if (!camera) return;

        // Criar overlay vermelho
        const damageOverlay = document.createElement('a-plane');
        damageOverlay.setAttribute('position', '0 0 -1');
        damageOverlay.setAttribute('width', '4');
        damageOverlay.setAttribute('height', '3');
        damageOverlay.setAttribute('color', 'red');
        damageOverlay.setAttribute('opacity', '0.3');
        damageOverlay.setAttribute('animation', {
            property: 'opacity',
            from: '0.3',
            to: '0',
            dur: 500,
            easing: 'easeOutQuad'
        });

        camera.appendChild(damageOverlay);

        // Remover overlay após animação
        setTimeout(() => {
            if (damageOverlay.parentNode) {
                damageOverlay.parentNode.removeChild(damageOverlay);
            }
        }, 600);
    },

    showScoreboard: function () {
        // Implementar scoreboard temporário
        console.log('📊 Scoreboard solicitado');
        // TODO: Implementar interface de scoreboard
    },

    tick: function () {
        // Verificar movimento para sincronização multiplayer
        const currentPosition = this.el.getAttribute('position');
        const currentRotation = this.el.getAttribute('rotation');
        
        const positionChanged = this.hasPositionChanged(currentPosition, this.player.lastPosition);
        const rotationChanged = this.hasRotationChanged(currentRotation, this.player.lastRotation);
        
        if (positionChanged || rotationChanged) {
            // Enviar atualização de posição para o servidor
            if (window.networkManager) {
                window.networkManager.updatePosition({
                    position: currentPosition,
                    rotation: currentRotation
                });
            }
            
            this.player.lastPosition = { ...currentPosition };
            this.player.lastRotation = { ...currentRotation };
        }
    },

    hasPositionChanged: function (current, last) {
        const threshold = 0.1;
        return Math.abs(current.x - last.x) > threshold ||
               Math.abs(current.y - last.y) > threshold ||
               Math.abs(current.z - last.z) > threshold;
    },

    hasRotationChanged: function (current, last) {
        const threshold = 1;
        return Math.abs(current.x - last.x) > threshold ||
               Math.abs(current.y - last.y) > threshold ||
               Math.abs(current.z - last.z) > threshold;
    },

    updateHealth: function (newHealth) {
        this.player.health = newHealth;
        
        // Atualizar HUD
        const healthText = document.querySelector('#healthText');
        if (healthText) {
            healthText.setAttribute('value', `VIDA: ${this.player.health}`);
            
            // Mudar cor baseada na vida
            if (this.player.health < 30) {
                healthText.setAttribute('color', 'red');
            } else if (this.player.health < 60) {
                healthText.setAttribute('color', 'orange');
            } else {
                healthText.setAttribute('color', 'green');
            }
        }
    },

    updateScore: function (newScore) {
        this.player.score = newScore;
        
        // Atualizar HUD
        const scoreText = document.querySelector('#scoreText');
        if (scoreText) {
            scoreText.setAttribute('value', `PONTOS: ${this.player.score}`);
        }
    },

    updateWeapon: function (newWeapon) {
        this.player.weapon = newWeapon;
        
        // Atualizar visual da arma
        const weapon = this.el.querySelector('#weapon');
        if (weapon) {
            if (newWeapon === 'sniper') {
                weapon.setAttribute('scale', '1.2 1.2 1.5');
                weapon.setAttribute('color', '#FFD700');
            } else {
                weapon.setAttribute('scale', '1 1 1');
                weapon.setAttribute('color', '#333');
            }
        }
        
        console.log(`🔫 Arma atualizada para: ${newWeapon}`);
    }
});