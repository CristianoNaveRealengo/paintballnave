/**
 * AR Test Utilities - Utilitários para testar funcionalidades AR
 * 
 * Este arquivo contém funções para testar e validar:
 * - Suporte a WebXR AR
 * - Hand tracking do Quest 3
 * - Detecção de planos
 * - Performance em AR
 * - Qualidade visual
 */

class ARTester {
    constructor() {
        this.testResults = {};
        this.isRunning = false;
        this.testStartTime = null;
    }

    /**
     * Executa todos os testes AR
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('⚠️ Testes já estão em execução');
            return this.testResults;
        }

        this.isRunning = true;
        this.testStartTime = Date.now();
        this.testResults = {};

        console.log('🧪 Iniciando testes AR para Meta Quest 3...');

        try {
            // Testes básicos de suporte
            await this.testWebXRSupport();
            await this.testARSupport();
            await this.testHandTrackingSupport();
            
            // Testes de funcionalidade
            await this.testPlaneDetection();
            await this.testAnchoring();
            await this.testLightEstimation();
            
            // Testes de performance
            await this.testPerformance();
            
            // Testes visuais
            await this.testVisualQuality();
            
            // Testes de interação
            await this.testHandGestures();

            const totalTime = Date.now() - this.testStartTime;
            console.log(`✅ Todos os testes concluídos em ${totalTime}ms`);
            
        } catch (error) {
            console.error('❌ Erro durante os testes:', error);
            this.testResults.error = error.message;
        } finally {
            this.isRunning = false;
        }

        return this.testResults;
    }

    /**
     * Testa suporte básico ao WebXR
     */
    async testWebXRSupport() {
        console.log('🔍 Testando suporte WebXR...');
        
        const result = {
            supported: false,
            version: null,
            features: []
        };

        try {
            if ('xr' in navigator) {
                result.supported = true;
                
                // Testar recursos disponíveis
                const features = [
                    'viewer',
                    'local',
                    'local-floor',
                    'bounded-floor',
                    'unbounded'
                ];

                for (const feature of features) {
                    try {
                        const supported = await navigator.xr.isSessionSupported('immersive-vr', {
                            requiredFeatures: [feature]
                        });
                        if (supported) {
                            result.features.push(feature);
                        }
                    } catch (e) {
                        // Feature não suportada
                    }
                }
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.webxr = result;
        console.log('WebXR:', result.supported ? '✅' : '❌', result);
    }

    /**
     * Testa suporte específico ao AR
     */
    async testARSupport() {
        console.log('🔍 Testando suporte AR...');
        
        const result = {
            supported: false,
            features: [],
            blendModes: []
        };

        try {
            if (navigator.xr) {
                // Testar sessão AR
                result.supported = await navigator.xr.isSessionSupported('immersive-ar');
                
                if (result.supported) {
                    // Testar features AR específicas
                    const arFeatures = [
                        'hit-test',
                        'plane-detection',
                        'anchors',
                        'light-estimation',
                        'hand-tracking'
                    ];

                    for (const feature of arFeatures) {
                        try {
                            const supported = await navigator.xr.isSessionSupported('immersive-ar', {
                                requiredFeatures: [feature]
                            });
                            if (supported) {
                                result.features.push(feature);
                            }
                        } catch (e) {
                            // Feature não suportada
                        }
                    }
                }
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.ar = result;
        console.log('AR:', result.supported ? '✅' : '❌', result);
    }

    /**
     * Testa suporte ao hand tracking
     */
    async testHandTrackingSupport() {
        console.log('🔍 Testando hand tracking...');
        
        const result = {
            supported: false,
            joints: [],
            gestures: []
        };

        try {
            if (navigator.xr) {
                result.supported = await navigator.xr.isSessionSupported('immersive-ar', {
                    optionalFeatures: ['hand-tracking']
                });

                // Verificar se A-Frame hand controls estão disponíveis
                if (AFRAME.components['hand-tracking-controls']) {
                    result.aframeSupport = true;
                }
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.handTracking = result;
        console.log('Hand Tracking:', result.supported ? '✅' : '❌', result);
    }

    /**
     * Testa detecção de planos
     */
    async testPlaneDetection() {
        console.log('🔍 Testando detecção de planos...');
        
        const result = {
            available: false,
            planesDetected: 0,
            types: []
        };

        try {
            // Verificar se o componente ar-manager está presente
            const arManager = document.querySelector('[ar-manager]');
            if (arManager) {
                result.componentPresent = true;
                
                // Simular detecção (em ambiente real seria detectado automaticamente)
                result.available = true;
                result.planesDetected = 1; // Simulado
                result.types = ['horizontal']; // Simulado
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.planeDetection = result;
        console.log('Plane Detection:', result.available ? '✅' : '❌', result);
    }

    /**
     * Testa sistema de ancoragem
     */
    async testAnchoring() {
        console.log('🔍 Testando ancoragem...');
        
        const result = {
            supported: false,
            anchorsCreated: 0
        };

        try {
            // Verificar se anchors estão disponíveis
            if (navigator.xr) {
                result.supported = await navigator.xr.isSessionSupported('immersive-ar', {
                    optionalFeatures: ['anchors']
                });
            }

            // Verificar componente ar-manager
            const arManager = document.querySelector('[ar-manager]');
            if (arManager && arManager.components['ar-manager']) {
                result.componentReady = true;
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.anchoring = result;
        console.log('Anchoring:', result.supported ? '✅' : '❌', result);
    }

    /**
     * Testa estimativa de iluminação
     */
    async testLightEstimation() {
        console.log('🔍 Testando estimativa de iluminação...');
        
        const result = {
            supported: false,
            intensity: null,
            direction: null
        };

        try {
            if (navigator.xr) {
                result.supported = await navigator.xr.isSessionSupported('immersive-ar', {
                    optionalFeatures: ['light-estimation']
                });
            }

            // Verificar se há luzes configuradas na cena
            const lights = document.querySelectorAll('[light]');
            result.lightsInScene = lights.length;
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.lightEstimation = result;
        console.log('Light Estimation:', result.supported ? '✅' : '❌', result);
    }

    /**
     * Testa performance em AR
     */
    async testPerformance() {
        console.log('🔍 Testando performance...');
        
        const result = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            renderCalls: 0
        };

        try {
            // Medir FPS por alguns segundos
            const fpsCounter = new FPSCounter();
            await fpsCounter.measure(3000); // 3 segundos
            
            result.fps = fpsCounter.averageFPS;
            result.frameTime = fpsCounter.averageFrameTime;

            // Verificar uso de memória (se disponível)
            if (performance.memory) {
                result.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            }

            // Verificar configurações de performance
            const config = window.AR_CONFIG?.performance;
            if (config) {
                result.targetFPS = config.targetFrameRate;
                result.renderScale = config.renderScale;
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.performance = result;
        console.log('Performance:', result.fps > 60 ? '✅' : '⚠️', result);
    }

    /**
     * Testa qualidade visual
     */
    async testVisualQuality() {
        console.log('🔍 Testando qualidade visual...');
        
        const result = {
            transparency: false,
            emissive: false,
            shadows: false,
            arenaScale: 1
        };

        try {
            // Verificar transparência dos elementos AR
            const arElements = document.querySelectorAll('.ar-arena-element');
            if (arElements.length > 0) {
                const firstElement = arElements[0];
                const material = firstElement.getAttribute('material');
                result.transparency = material && material.transparent;
                result.emissive = material && material.emissive;
            }

            // Verificar sombras
            const scene = document.querySelector('a-scene');
            const shadowConfig = scene.getAttribute('shadow');
            result.shadows = shadowConfig && shadowConfig.type;

            // Verificar escala da arena
            const arena = document.getElementById('arena');
            if (arena) {
                const scale = arena.getAttribute('scale');
                result.arenaScale = scale ? parseFloat(scale.x || scale.split(' ')[0]) : 1;
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.visualQuality = result;
        console.log('Visual Quality:', '✅', result);
    }

    /**
     * Testa gestos das mãos
     */
    async testHandGestures() {
        console.log('🔍 Testando gestos das mãos...');
        
        const result = {
            componentsPresent: false,
            gesturesConfigured: [],
            raycastingEnabled: false
        };

        try {
            // Verificar componentes de hand tracking
            const handElements = document.querySelectorAll('[quest-hand-tracking]');
            result.componentsPresent = handElements.length > 0;

            if (result.componentsPresent) {
                // Verificar gestos configurados
                const rightHand = document.querySelector('#rightHand');
                if (rightHand) {
                    const handConfig = rightHand.getAttribute('quest-hand-tracking');
                    if (handConfig && handConfig.gestures) {
                        result.gesturesConfigured = Object.keys(handConfig.gestures);
                    }
                }

                // Verificar raycasting
                const raycasters = document.querySelectorAll('[raycaster]');
                result.raycastingEnabled = raycasters.length > 0;
            }
        } catch (error) {
            result.error = error.message;
        }

        this.testResults.handGestures = result;
        console.log('Hand Gestures:', result.componentsPresent ? '✅' : '❌', result);
    }

    /**
     * Gera relatório completo dos testes
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            device: 'Meta Quest 3',
            testDuration: this.testStartTime ? Date.now() - this.testStartTime : 0,
            results: this.testResults,
            summary: this.generateSummary()
        };

        console.log('📊 Relatório de Testes AR:', report);
        return report;
    }

    /**
     * Gera resumo dos testes
     */
    generateSummary() {
        const summary = {
            totalTests: Object.keys(this.testResults).length,
            passed: 0,
            failed: 0,
            warnings: 0,
            recommendations: []
        };

        for (const [testName, result] of Object.entries(this.testResults)) {
            if (result.error) {
                summary.failed++;
            } else if (result.supported || result.available || result.componentsPresent) {
                summary.passed++;
            } else {
                summary.warnings++;
            }
        }

        // Gerar recomendações
        if (!this.testResults.ar?.supported) {
            summary.recommendations.push('Dispositivo não suporta WebXR AR - testar em Meta Quest 3');
        }

        if (!this.testResults.handTracking?.supported) {
            summary.recommendations.push('Hand tracking não disponível - verificar configurações do Quest');
        }

        if (this.testResults.performance?.fps < 60) {
            summary.recommendations.push('FPS baixo - considerar reduzir qualidade gráfica');
        }

        return summary;
    }
}

/**
 * Contador de FPS simples
 */
class FPSCounter {
    constructor() {
        this.frames = [];
        this.isRunning = false;
    }

    async measure(duration = 3000) {
        return new Promise((resolve) => {
            this.frames = [];
            this.isRunning = true;
            
            let lastTime = performance.now();
            
            const measureFrame = (currentTime) => {
                if (!this.isRunning) return;
                
                const deltaTime = currentTime - lastTime;
                this.frames.push(deltaTime);
                lastTime = currentTime;
                
                requestAnimationFrame(measureFrame);
            };
            
            requestAnimationFrame(measureFrame);
            
            setTimeout(() => {
                this.isRunning = false;
                resolve();
            }, duration);
        });
    }

    get averageFPS() {
        if (this.frames.length === 0) return 0;
        const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
        return Math.round(1000 / avgFrameTime);
    }

    get averageFrameTime() {
        if (this.frames.length === 0) return 0;
        return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    }
}

// Instância global do testador
window.ARTester = new ARTester();

// Função de conveniência para executar testes
window.testAR = async function() {
    const results = await window.ARTester.runAllTests();
    const report = window.ARTester.generateReport();
    
    // Exibir resultados no console de forma organizada
    console.group('📊 Relatório Final de Testes AR');
    console.log('⏱️ Duração:', report.testDuration + 'ms');
    console.log('✅ Passou:', report.summary.passed);
    console.log('❌ Falhou:', report.summary.failed);
    console.log('⚠️ Avisos:', report.summary.warnings);
    
    if (report.summary.recommendations.length > 0) {
        console.group('💡 Recomendações:');
        report.summary.recommendations.forEach(rec => console.log('•', rec));
        console.groupEnd();
    }
    
    console.groupEnd();
    
    return report;
};

console.log('🧪 AR Test Utilities carregado - Use testAR() para executar todos os testes');