// Sistema de Loading Screen com Mapa
class LoadingScreen {
    constructor() {
        this.isLoading = true;
        this.loadingProgress = 0;
        this.loadingSteps = [
            'Conectando ao servidor...',
            'Carregando arena...',
            'Inicializando física...',
            'Configurando VR...',
            'Aguardando jogadores...',
            'Iniciando jogo...'
        ];
        this.currentStep = 0;
        
        this.init();
    }

    init() {
        console.log('🎮 Inicializando Loading Screen...');
        this.createLoadingScreen();
        this.startLoadingSequence();
    }

    createLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        // Limpar conteúdo existente
        loadingScreen.innerHTML = '';

        // Container principal
        const container = document.createElement('div');
        container.className = 'loading-container';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            font-family: 'Arial', sans-serif;
            position: relative;
            overflow: hidden;
        `;

        // Título do jogo
        const title = document.createElement('h1');
        title.textContent = '🎯 PAINTBALL VR';
        title.style.cssText = `
            font-size: 4rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            animation: glow 2s ease-in-out infinite alternate;
        `;
        container.appendChild(title);

        // Preview do mapa
        this.createMapPreview(container);

        // Informações do jogo
        this.createGameInfo(container);

        // Barra de progresso
        this.createProgressBar(container);

        // Status de carregamento
        this.createLoadingStatus(container);

        // Controles VR
        this.createVRControls(container);

        // Adicionar estilos CSS
        this.addStyles();

        loadingScreen.appendChild(container);
    }

    createMapPreview(container) {
        // Container do mapa
        const mapContainer = document.createElement('div');
        mapContainer.style.cssText = `
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border: 2px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
        `;

        // Título do mapa
        const mapTitle = document.createElement('h2');
        mapTitle.textContent = '🗺️ ARENA DE COMBATE';
        mapTitle.style.cssText = `
            text-align: center;
            margin-bottom: 15px;
            color: #FFD700;
            font-size: 1.5rem;
        `;
        mapContainer.appendChild(mapTitle);

        // Canvas do mapa
        const mapCanvas = document.createElement('canvas');
        mapCanvas.id = 'mapCanvas';
        mapCanvas.width = 400;
        mapCanvas.height = 400;
        mapCanvas.style.cssText = `
            border: 2px solid #4CAF50;
            border-radius: 10px;
            background: #001122;
            display: block;
            margin: 0 auto;
        `;
        mapContainer.appendChild(mapCanvas);

        // Legenda do mapa
        const legend = document.createElement('div');
        legend.style.cssText = `
            display: flex;
            justify-content: space-around;
            margin-top: 15px;
            font-size: 0.9rem;
        `;

        const legendItems = [
            { color: '#4169E1', text: '🔵 Spawn Azul' },
            { color: '#DC143C', text: '🔴 Spawn Vermelho' },
            { color: '#00FF00', text: '❤️ Vida' },
            { color: '#FFD700', text: '🔫 Arma Especial' },
            { color: '#8B4513', text: '📦 Obstáculos' }
        ];

        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            legendItem.innerHTML = `
                <div style="width: 12px; height: 12px; background: ${item.color}; border-radius: 50%;"></div>
                <span>${item.text}</span>
            `;
            legend.appendChild(legendItem);
        });

        mapContainer.appendChild(legend);
        container.appendChild(mapContainer);

        // Desenhar o mapa
        this.drawMap(mapCanvas);
    }

    drawMap(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Limpar canvas
        ctx.fillStyle = '#001122';
        ctx.fillRect(0, 0, width, height);

        // Desenhar grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            const x = (i / 20) * width;
            const y = (i / 20) * height;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Desenhar paredes da arena
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Desenhar obstáculos (baseado nas imagens fornecidas)
        ctx.fillStyle = '#8B4513';
        
        // Obstáculos centrais
        this.drawObstacle(ctx, width * 0.4, height * 0.3, 30, 60);
        this.drawObstacle(ctx, width * 0.6, height * 0.3, 30, 60);
        this.drawObstacle(ctx, width * 0.4, height * 0.7, 30, 60);
        this.drawObstacle(ctx, width * 0.6, height * 0.7, 30, 60);
        
        // Obstáculos laterais
        this.drawObstacle(ctx, width * 0.2, height * 0.5, 40, 40);
        this.drawObstacle(ctx, width * 0.8, height * 0.5, 40, 40);
        
        // Obstáculos nos cantos
        this.drawObstacle(ctx, width * 0.15, height * 0.15, 25, 25);
        this.drawObstacle(ctx, width * 0.85, height * 0.15, 25, 25);
        this.drawObstacle(ctx, width * 0.15, height * 0.85, 25, 25);
        this.drawObstacle(ctx, width * 0.85, height * 0.85, 25, 25);

        // Desenhar spawns dos times
        // Time Azul (esquerda)
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(width * 0.1, height * 0.3, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.1, height * 0.7, 15, 0, 2 * Math.PI);
        ctx.fill();

        // Time Vermelho (direita)
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(width * 0.9, height * 0.3, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.9, height * 0.7, 15, 0, 2 * Math.PI);
        ctx.fill();

        // Desenhar pontos de vida
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(width * 0.3, height * 0.2, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.2, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.3, height * 0.8, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.8, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Desenhar arma especial (centro)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Adicionar animação de pulso na arma especial
        this.animateSpecialWeapon(ctx, width * 0.5, height * 0.5);
    }

    drawObstacle(ctx, x, y, width, height) {
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Adicionar sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x - width/2 + 2, y - height/2 + 2, width, height);
        ctx.fillStyle = '#8B4513';
    }

    animateSpecialWeapon(ctx, x, y) {
        let pulseSize = 12;
        let growing = true;
        
        setInterval(() => {
            if (this.isLoading) {
                // Limpar área da arma especial
                ctx.fillStyle = '#001122';
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, 2 * Math.PI);
                ctx.fill();
                
                // Desenhar arma especial com pulso
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
                ctx.fill();
                
                // Atualizar tamanho do pulso
                if (growing) {
                    pulseSize += 0.5;
                    if (pulseSize >= 18) growing = false;
                } else {
                    pulseSize -= 0.5;
                    if (pulseSize <= 12) growing = true;
                }
            }
        }, 50);
    }

    createGameInfo(container) {
        const infoContainer = document.createElement('div');
        infoContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
            width: 100%;
            max-width: 600px;
        `;

        const gameInfo = [
            { icon: '👥', title: 'Jogadores', value: '4 Máximo' },
            { icon: '⏱️', title: 'Duração', value: '5 Minutos' },
            { icon: '❤️', title: 'Vida', value: '100 HP' },
            { icon: '🎯', title: 'Objetivo', value: 'Mais Acertos' }
        ];

        gameInfo.forEach(info => {
            const infoCard = document.createElement('div');
            infoCard.style.cssText = `
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.2);
            `;
            
            infoCard.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 5px;">${info.icon}</div>
                <div style="font-weight: bold; margin-bottom: 5px;">${info.title}</div>
                <div style="color: #FFD700;">${info.value}</div>
            `;
            
            infoContainer.appendChild(infoCard);
        });

        container.appendChild(infoContainer);
    }

    createProgressBar(container) {
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 100%;
            max-width: 500px;
            margin: 30px 0;
        `;

        const progressLabel = document.createElement('div');
        progressLabel.id = 'progressLabel';
        progressLabel.textContent = 'Carregando...';
        progressLabel.style.cssText = `
            text-align: center;
            margin-bottom: 10px;
            font-size: 1.2rem;
            color: #FFD700;
        `;
        progressContainer.appendChild(progressLabel);

        const progressBarBg = document.createElement('div');
        progressBarBg.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.2);
        `;

        const progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 8px;
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        // Efeito de brilho na barra de progresso
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shine 2s infinite;
        `;
        progressBar.appendChild(shine);

        progressBarBg.appendChild(progressBar);
        progressContainer.appendChild(progressBarBg);

        const progressText = document.createElement('div');
        progressText.id = 'progressText';
        progressText.textContent = '0%';
        progressText.style.cssText = `
            text-align: center;
            margin-top: 10px;
            font-size: 1rem;
            color: white;
        `;
        progressContainer.appendChild(progressText);

        container.appendChild(progressContainer);
    }

    createLoadingStatus(container) {
        const statusContainer = document.createElement('div');
        statusContainer.style.cssText = `
            text-align: center;
            margin: 20px 0;
        `;

        const statusText = document.createElement('div');
        statusText.id = 'loadingStatus';
        statusText.textContent = this.loadingSteps[0];
        statusText.style.cssText = `
            font-size: 1.1rem;
            color: #87CEEB;
            margin-bottom: 15px;
        `;
        statusContainer.appendChild(statusText);

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        `;
        statusContainer.appendChild(spinner);

        container.appendChild(statusContainer);
    }

    createVRControls(container) {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            background: rgba(0,0,0,0.5);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        `;

        controlsContainer.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #FFD700;">🥽 Controles VR</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 0.9rem;">
                <div>🎮 <strong>Gatilho:</strong> Atirar</div>
                <div>✊ <strong>Grip:</strong> Recarregar</div>
                <div>👆 <strong>Joystick:</strong> Mover</div>
                <div>🔄 <strong>Cabeça:</strong> Mirar</div>
            </div>
            <div style="margin-top: 15px; font-size: 0.8rem; color: #87CEEB;">
                Certifique-se de que seu Meta Quest 3 está conectado
            </div>
        `;

        container.appendChild(controlsContainer);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                from { text-shadow: 2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.3); }
                to { text-shadow: 2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.6); }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .loading-container {
                animation: fadeIn 1s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    startLoadingSequence() {
        console.log('🔄 Iniciando sequência de carregamento...');
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Progresso variável
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                this.completeLoading();
            }
            
            this.updateProgress(progress);
            
            // Atualizar step baseado no progresso
            const stepIndex = Math.floor((progress / 100) * this.loadingSteps.length);
            if (stepIndex !== this.currentStep && stepIndex < this.loadingSteps.length) {
                this.currentStep = stepIndex;
                this.updateStatus(this.loadingSteps[this.currentStep]);
            }
            
        }, 500 + Math.random() * 1000); // Intervalo variável para realismo
    }

    updateProgress(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        this.loadingProgress = progress;
    }

    updateStatus(status) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Efeito de fade
            statusElement.style.opacity = '0';
            setTimeout(() => {
                statusElement.style.opacity = '1';
            }, 200);
        }
        
        console.log(`📋 Status: ${status}`);
    }

    completeLoading() {
        console.log('✅ Carregamento concluído!');
        this.isLoading = false;
        
        this.updateStatus('Pronto para jogar!');
        
        // Aguardar um pouco antes de esconder a tela de loading
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 1s ease-out';
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Mostrar cena do jogo
                const scene = document.querySelector('#scene');
                if (scene) {
                    scene.style.display = 'block';
                }
                
                console.log('🎮 Entrando no jogo!');
            }, 1000);
        }
    }

    // Método para ser chamado externamente quando o jogo estiver realmente pronto
    setGameReady() {
        if (this.loadingProgress < 100) {
            this.updateProgress(100);
            this.completeLoading();
        }
    }
}

// Inicializar Loading Screen quando a página carregar
window.addEventListener('load', () => {
    window.loadingScreen = new LoadingScreen();
});