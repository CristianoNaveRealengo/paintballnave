// Gerenciador de rede para multiplayer
class NetworkManager {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.players = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }

    init() {
        console.log('🌐 Inicializando NetworkManager...');
        this.connect();
    }

    connect() {
        try {
            // Conectar ao servidor Socket.io
            this.socket = io(window.location.origin, {
                transports: ['websocket', 'polling'],
                timeout: 10000, // Aumentado para 10 segundos
                forceNew: true,
                reconnection: true, // Habilitar reconexão automática
                reconnectionDelay: 1000, // Delay inicial de 1 segundo
                reconnectionDelayMax: 5000, // Delay máximo de 5 segundos
                maxReconnectionAttempts: 10, // Máximo de 10 tentativas
                randomizationFactor: 0.5 // Randomização para evitar thundering herd
            });

            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            this.handleReconnect();
        }
    }

    setupEventListeners() {
        // Eventos de conexão
        this.socket.on('connect', () => {
            console.log('✅ Conectado ao servidor');
            console.log('🔗 Socket ID:', this.socket.id);
            console.log('🌐 Transport:', this.socket.io.engine.transport.name);
            this.isConnected = true;
            this.playerId = this.socket.id;
            this.reconnectAttempts = 0;
            
            // Esconder mensagem de erro se existir
            this.hideConnectionError();
            
            // Entrar no jogo automaticamente
            this.joinGame();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado do servidor:', reason);
            console.log('🔍 Detalhes da desconexão:', {
                reason,
                connected: this.socket.connected,
                disconnected: this.socket.disconnected
            });
            this.isConnected = false;
            
            // Mostrar notificação de desconexão
            this.showDisconnectionNotice(reason);
            
            if (reason === 'io server disconnect' || reason === 'transport close') {
                // Servidor desconectou ou transporte fechou, tentar reconectar
                console.log('🔄 Iniciando processo de reconexão...');
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Erro de conexão:', error);
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                type: error.type,
                description: error.description
            });
            this.handleReconnect();
        });

        // Monitorar mudanças de transporte
        this.socket.io.on('upgrade', () => {
            console.log('⬆️ Upgrade de transporte para:', this.socket.io.engine.transport.name);
        });

        this.socket.io.on('upgradeError', (error) => {
            console.warn('⚠️ Erro no upgrade de transporte:', error);
        });

        // Eventos do jogo
        this.socket.on('playerJoined', (data) => {
            this.handlePlayerJoined(data);
        });

        this.socket.on('playerConnected', (player) => {
            this.handlePlayerConnected(player);
        });

        this.socket.on('playerDisconnected', (playerId) => {
            this.handlePlayerDisconnected(playerId);
        });

        this.socket.on('playerMoved', (data) => {
            this.handlePlayerMoved(data);
        });

        this.socket.on('projectileFired', (projectile) => {
            this.handleProjectileFired(projectile);
        });

        this.socket.on('playerHit', (data) => {
            this.handlePlayerHit(data);
        });

        this.socket.on('playerRespawned', (data) => {
            this.handlePlayerRespawned(data);
        });

        this.socket.on('healthPackCollected', (data) => {
            this.handleHealthPackCollected(data);
        });

        this.socket.on('healthPackRespawned', (packId) => {
            this.handleHealthPackRespawned(packId);
        });

        this.socket.on('specialWeaponCollected', (data) => {
            this.handleSpecialWeaponCollected(data);
        });

        this.socket.on('specialWeaponRespawned', (weapon) => {
            this.handleSpecialWeaponRespawned(weapon);
        });

        this.socket.on('gameStarted', (data) => {
            this.handleGameStarted(data);
        });

        this.socket.on('gameEnded', (data) => {
            this.handleGameEnded(data);
        });

        this.socket.on('gamePaused', (message) => {
            this.handleGamePaused(message);
        });

        this.socket.on('timeUpdate', (timeLeft) => {
            this.handleTimeUpdate(timeLeft);
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.connect();
            }, 2000 * this.reconnectAttempts);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
            this.showConnectionError();
        }
    }

    showConnectionError() {
        // Remover mensagem anterior se existir
        this.hideConnectionError();
        
        // Mostrar mensagem de erro de conexão
        const errorDiv = document.createElement('div');
        errorDiv.id = 'connectionError';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 2000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>❌ Erro de Conexão</h3>
            <p>Não foi possível conectar ao servidor.</p>
            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
                🔄 Tentar Novamente
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    hideConnectionError() {
        // Remover mensagem de erro se existir
        const errorDiv = document.querySelector('#connectionError');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        // Remover notificação de desconexão se existir
        const disconnectionNotice = document.querySelector('#disconnectionNotice');
        if (disconnectionNotice) {
            disconnectionNotice.remove();
        }
    }

    showDisconnectionNotice(reason) {
        // Remover notificação anterior se existir
        const existingNotice = document.querySelector('#disconnectionNotice');
        if (existingNotice) {
            existingNotice.remove();
        }

        // Criar notificação de desconexão
        const notice = document.createElement('div');
        notice.id = 'disconnectionNotice';
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 165, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1500;
            font-family: Arial, sans-serif;
            max-width: 300px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;

        // Traduzir motivo da desconexão
        let reasonText = reason;
        switch(reason) {
            case 'transport close':
                reasonText = 'Conexão perdida';
                break;
            case 'io server disconnect':
                reasonText = 'Servidor desconectou';
                break;
            case 'ping timeout':
                reasonText = 'Timeout de conexão';
                break;
            case 'transport error':
                reasonText = 'Erro de transporte';
                break;
        }

        notice.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚠️</span>
                <div>
                    <div style="font-weight: bold;">Desconectado</div>
                    <div style="font-size: 12px;">${reasonText}</div>
                    <div style="font-size: 11px; margin-top: 5px;">Tentando reconectar...</div>
                </div>
            </div>
        `;

        document.body.appendChild(notice);

        // Remover automaticamente após 10 segundos
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
            }
        }, 10000);
    }

    joinGame() {
        if (!this.isConnected) return;

        const playerName = this.generatePlayerName();
        
        this.socket.emit('joinGame', {
            name: playerName,
            timestamp: Date.now()
        });

        console.log(`🎮 Entrando no jogo como: ${playerName}`);
    }

    generatePlayerName() {
        const adjectives = ['Rápido', 'Preciso', 'Ninja', 'Sniper', 'Guerreiro', 'Atirador'];
        const nouns = ['Azul', 'Vermelho', 'Verde', 'Dourado', 'Prateado', 'Negro'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
    }

    // Métodos para enviar dados ao servidor
    updatePosition(data) {
        if (this.isConnected) {
            this.socket.emit('playerMove', data);
        }
    }

    shoot(shootData) {
        if (this.isConnected) {
            this.socket.emit('shoot', shootData);
        }
    }

    reportHit(hitData) {
        if (this.isConnected) {
            this.socket.emit('hit', hitData);
        }
    }

    collectHealthPack(packId) {
        if (this.isConnected) {
            this.socket.emit('collectHealthPack', { packId });
        }
    }

    collectSpecialWeapon() {
        if (this.isConnected) {
            this.socket.emit('collectSpecialWeapon');
        }
    }

    // Handlers para eventos recebidos do servidor
    handlePlayerJoined(data) {
        console.log('✅ Jogador entrou no jogo:', data.player.name);
        
        // Configurar jogador local
        const playerRig = document.querySelector('#playerRig');
        if (playerRig) {
            const playerController = playerRig.components['player-controller'];
            if (playerController) {
                playerController.player = { ...data.player };
                playerController.updateHealth(data.player.health);
                playerController.updateScore(data.player.score);
                
                // Posicionar jogador
                playerRig.setAttribute('position', data.player.position);
            }
        }

        // Criar outros jogadores já conectados
        data.gameState.players.forEach(player => {
            if (player.id !== this.playerId) {
                this.createOtherPlayer(player);
            }
        });

        // Atualizar estado do jogo
        this.updateGameState(data.gameState);
    }

    handlePlayerConnected(player) {
        console.log('👤 Novo jogador conectado:', player.name);
        this.createOtherPlayer(player);
    }

    handlePlayerDisconnected(playerId) {
        console.log('👋 Jogador desconectado:', playerId);
        this.removeOtherPlayer(playerId);
    }

    handlePlayerMoved(data) {
        const otherPlayer = document.querySelector(`#player_${data.playerId}`);
        if (otherPlayer) {
            otherPlayer.setAttribute('position', data.position);
            
            // Atualizar rotação da cabeça
            const head = otherPlayer.querySelector('.player-head');
            if (head) {
                head.setAttribute('rotation', data.rotation);
            }
        }
    }

    handleProjectileFired(projectile) {
        // Criar projétil visual apenas se não for do jogador local
        if (projectile.playerId !== this.playerId) {
            const weaponSystem = document.querySelector('[weapon-system]');
            if (weaponSystem) {
                weaponSystem.components['weapon-system'].createProjectile(projectile);
            }
        }
    }

    handlePlayerHit(data) {
        console.log('💥 Jogador atingido:', data);
        
        // Atualizar vida do jogador atingido
        if (data.targetId === this.playerId) {
            const playerRig = document.querySelector('#playerRig');
            const playerController = playerRig?.components['player-controller'];
            if (playerController) {
                playerController.updateHealth(data.targetHealth);
            }
        }

        // Atualizar pontuação do atirador
        if (data.shooterId === this.playerId) {
            const playerRig = document.querySelector('#playerRig');
            const playerController = playerRig?.components['player-controller'];
            if (playerController) {
                playerController.updateScore(data.shooterScore);
            }
        }

        // Criar efeito visual de acerto
        this.createHitEffect(data);
    }

    handlePlayerRespawned(data) {
        console.log('🔄 Jogador respawnou:', data.playerId);
        
        if (data.playerId === this.playerId) {
            // Respawn do jogador local
            const playerRig = document.querySelector('#playerRig');
            if (playerRig) {
                playerRig.setAttribute('position', data.position);
                
                const playerController = playerRig.components['player-controller'];
                if (playerController) {
                    playerController.updateHealth(data.health);
                }
            }
        } else {
            // Respawn de outro jogador
            const otherPlayer = document.querySelector(`#player_${data.playerId}`);
            if (otherPlayer) {
                otherPlayer.setAttribute('position', data.position);
                otherPlayer.setAttribute('visible', true);
            }
        }
    }

    handleHealthPackCollected(data) {
        console.log('❤️ Health pack coletado:', data);
        
        // Esconder health pack
        const healthPack = document.querySelector(`#${data.packId}`);
        if (healthPack) {
            healthPack.setAttribute('visible', false);
        }

        // Atualizar vida se for o jogador local
        if (data.playerId === this.playerId) {
            const playerRig = document.querySelector('#playerRig');
            const playerController = playerRig?.components['player-controller'];
            if (playerController) {
                playerController.updateHealth(data.newHealth);
            }
        }
    }

    handleHealthPackRespawned(packId) {
        console.log('❤️ Health pack respawnou:', packId);
        
        const healthPack = document.querySelector(`#${packId}`);
        if (healthPack) {
            healthPack.setAttribute('visible', true);
            
            // Efeito de respawn
            healthPack.setAttribute('animation__respawn', {
                property: 'scale',
                from: '0 0 0',
                to: '1 1 1',
                dur: 500,
                easing: 'easeOutBounce'
            });
        }
    }

    handleSpecialWeaponCollected(data) {
        console.log('🔫 Arma especial coletada:', data);
        
        // Esconder arma especial
        const specialWeapon = document.querySelector('[special-weapon]');
        if (specialWeapon) {
            specialWeapon.setAttribute('visible', false);
        }

        // Atualizar arma se for o jogador local
        if (data.playerId === this.playerId) {
            const playerRig = document.querySelector('#playerRig');
            const playerController = playerRig?.components['player-controller'];
            if (playerController) {
                playerController.updateWeapon(data.weapon);
            }
        }
    }

    handleSpecialWeaponRespawned(weapon) {
        console.log('🔫 Arma especial respawnou:', weapon);
        
        const specialWeapon = document.querySelector('[special-weapon]');
        if (specialWeapon) {
            specialWeapon.setAttribute('visible', true);
            
            // Efeito de respawn
            specialWeapon.setAttribute('animation__respawn', {
                property: 'scale',
                from: '0 0 0',
                to: '1 1 1',
                dur: 800,
                easing: 'easeOutBounce'
            });
        }
    }

    handleGameStarted(data) {
        console.log('🎮 Jogo iniciado!', data);
        
        // Esconder tela de loading
        const loadingScreen = document.querySelector('#loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        // Mostrar cena do jogo
        const scene = document.querySelector('#scene');
        if (scene) {
            scene.style.display = 'block';
        }

        // Mostrar mensagem de início
        this.showGameMessage('🎮 JOGO INICIADO!', 'green', 3000);
    }

    handleGameEnded(data) {
        console.log('🏆 Jogo finalizado!', data);
        
        // Mostrar resultado
        this.showGameResult(data);
    }

    handleGamePaused(message) {
        console.log('⏸️ Jogo pausado:', message);
        this.showGameMessage(`⏸️ ${message}`, 'orange', 5000);
    }

    handleTimeUpdate(timeLeft) {
        // Atualizar timer no HUD
        const timerText = document.querySelector('#timerText');
        if (timerText) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerText.setAttribute('value', `TEMPO: ${minutes}:${seconds.toString().padStart(2, '0')}`);
            
            // Mudar cor quando tempo está acabando
            if (timeLeft <= 30) {
                timerText.setAttribute('color', 'red');
            } else if (timeLeft <= 60) {
                timerText.setAttribute('color', 'orange');
            } else {
                timerText.setAttribute('color', 'white');
            }
        }
    }

    // Métodos auxiliares
    createOtherPlayer(player) {
        // Verificar se jogador já existe
        if (document.querySelector(`#player_${player.id}`)) {
            return;
        }

        // Criar representação visual do outro jogador
        const otherPlayer = document.createElement('a-entity');
        otherPlayer.id = `player_${player.id}`;
        otherPlayer.setAttribute('position', player.position);

        // Corpo do jogador
        const body = document.createElement('a-cylinder');
        body.setAttribute('radius', '0.3');
        body.setAttribute('height', '1.6');
        body.setAttribute('color', player.team === 'blue' ? '#4169E1' : '#DC143C');
        body.setAttribute('position', '0 0.8 0');
        otherPlayer.appendChild(body);

        // Cabeça do jogador
        const head = document.createElement('a-sphere');
        head.setAttribute('radius', '0.2');
        head.setAttribute('color', '#ffcccc');
        head.setAttribute('position', '0 1.8 0');
        head.classList.add('player-head');
        otherPlayer.appendChild(head);

        // Nome do jogador
        const nameTag = document.createElement('a-text');
        nameTag.setAttribute('value', player.name);
        nameTag.setAttribute('position', '0 2.2 0');
        nameTag.setAttribute('align', 'center');
        nameTag.setAttribute('color', 'white');
        nameTag.setAttribute('scale', '0.8 0.8 0.8');
        otherPlayer.appendChild(nameTag);

        // Arma do jogador
        const weapon = document.createElement('a-box');
        weapon.setAttribute('width', '0.1');
        weapon.setAttribute('height', '0.1');
        weapon.setAttribute('depth', '0.6');
        weapon.setAttribute('color', '#333');
        weapon.setAttribute('position', '0.3 1.2 -0.3');
        otherPlayer.appendChild(weapon);

        // Adicionar à cena
        const otherPlayersContainer = document.querySelector('#otherPlayers');
        if (otherPlayersContainer) {
            otherPlayersContainer.appendChild(otherPlayer);
        }

        console.log(`👤 Jogador criado: ${player.name} (${player.team})`);
    }

    removeOtherPlayer(playerId) {
        const otherPlayer = document.querySelector(`#player_${playerId}`);
        if (otherPlayer && otherPlayer.parentNode) {
            otherPlayer.parentNode.removeChild(otherPlayer);
        }
    }

    createHitEffect(data) {
        // Criar efeito visual de acerto
        const effect = document.createElement('a-text');
        effect.setAttribute('value', `-${data.damage}`);
        effect.setAttribute('color', 'red');
        effect.setAttribute('scale', '2 2 2');
        effect.setAttribute('align', 'center');
        
        // Posicionar próximo ao jogador atingido
        const targetPlayer = document.querySelector(`#player_${data.targetId}`);
        if (targetPlayer) {
            const position = targetPlayer.getAttribute('position');
            effect.setAttribute('position', `${position.x} ${position.y + 2.5} ${position.z}`);
        }

        // Animação de movimento e desaparecimento
        effect.setAttribute('animation', {
            property: 'position',
            from: effect.getAttribute('position'),
            to: `${effect.getAttribute('position').x} ${effect.getAttribute('position').y + 1} ${effect.getAttribute('position').z}`,
            dur: 1000,
            easing: 'easeOutQuad'
        });
        
        effect.setAttribute('animation__fade', {
            property: 'opacity',
            from: '1',
            to: '0',
            dur: 1000,
            easing: 'easeOutQuad'
        });

        document.querySelector('a-scene').appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1100);
    }

    updateGameState(gameState) {
        // Atualizar health packs
        gameState.healthPacks.forEach(pack => {
            const healthPack = document.querySelector(`#${pack.id}`);
            if (healthPack) {
                healthPack.setAttribute('visible', pack.active);
            }
        });

        // Atualizar arma especial
        const specialWeapon = document.querySelector('[special-weapon]');
        if (specialWeapon) {
            specialWeapon.setAttribute('visible', gameState.specialWeapon.active);
        }

        // Atualizar timer
        if (gameState.gameTime) {
            this.handleTimeUpdate(gameState.gameTime);
        }
    }

    showGameMessage(message, color = 'white', duration = 3000) {
        const messageEl = document.createElement('a-text');
        messageEl.setAttribute('value', message);
        messageEl.setAttribute('color', color);
        messageEl.setAttribute('scale', '3 3 3');
        messageEl.setAttribute('align', 'center');
        messageEl.setAttribute('position', '0 2 -5');
        
        messageEl.setAttribute('animation', {
            property: 'scale',
            from: '0 0 0',
            to: '3 3 3',
            dur: 500,
            easing: 'easeOutBounce'
        });

        const camera = document.querySelector('#playerCamera');
        if (camera) {
            camera.appendChild(messageEl);
        }

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, duration);
    }

    showGameResult(data) {
        // Criar tela de resultado
        const resultScreen = document.createElement('div');
        resultScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        `;

        resultScreen.innerHTML = `
            <h1 style="font-size: 48px; margin-bottom: 20px;">🏆 JOGO FINALIZADO!</h1>
            <h2 style="font-size: 36px; color: gold; margin-bottom: 30px;">
                Vencedor: ${data.winner.name}
            </h2>
            <div style="font-size: 24px; margin-bottom: 30px;">
                <h3>📊 Pontuação Final:</h3>
                ${data.finalScores.map(score => 
                    `<p>${score.name}: ${score.score} pontos</p>`
                ).join('')}
            </div>
            <button onclick="location.reload()" 
                    style="padding: 15px 30px; font-size: 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🔄 Jogar Novamente
            </button>
        `;

        document.body.appendChild(resultScreen);
    }
}

// Inicializar NetworkManager quando a página carregar
window.addEventListener('load', () => {
    window.networkManager = new NetworkManager();
});