/**
 * Componente Safe Physics
 * Garante que a física seja aplicada apenas quando o elemento está completamente inicializado
 */

AFRAME.registerComponent('safe-physics', {
    schema: {
        type: { type: 'string', default: 'static' },
        shape: { type: 'string', default: 'box' },
        mass: { type: 'number', default: 0 }
    },

    init: function() {
        // Aguardar elemento estar totalmente carregado
        if (this.el.hasLoaded) {
            this.setupPhysics();
        } else {
            this.el.addEventListener('loaded', () => {
                this.setupPhysics();
            });
        }
    },

    setupPhysics: function() {
        const data = this.data;
        
        try {
            // Garantir que o elemento tenha material antes de aplicar física
            this.ensureMaterial();
            
            // Aguardar um frame para garantir que o material foi processado
            setTimeout(() => {
                this.applyPhysics(data);
            }, 50);
            
        } catch (error) {
            console.warn('Erro ao configurar física segura:', error);
            // Tentar novamente após um tempo
            setTimeout(() => {
                this.setupPhysics();
            }, 200);
        }
    },

    ensureMaterial: function() {
        // Verificar se o elemento já tem material
        let material = this.el.getAttribute('material');
        
        if (!material || typeof material !== 'object') {
            // Criar material padrão
            const defaultMaterial = {
                color: '#ffffff',
                transparent: true,
                opacity: 1.0,
                shader: 'standard'
            };
            
            this.el.setAttribute('material', defaultMaterial);
            console.log('🔧 Material padrão criado para:', this.el.tagName);
        }
        
        // Aguardar o material ser processado pelo A-Frame
        return new Promise((resolve) => {
            const checkMaterial = () => {
                const materialComponent = this.el.components.material;
                if (materialComponent && materialComponent.material) {
                    resolve();
                } else {
                    setTimeout(checkMaterial, 10);
                }
            };
            checkMaterial();
        });
    },

    applyPhysics: function(data) {
        try {
            // Verificar se o sistema de física está disponível
            const scene = this.el.sceneEl;
            if (!scene || !scene.systems || !scene.systems.physics) {
                console.warn('Sistema de física não disponível, tentando novamente...');
                setTimeout(() => this.applyPhysics(data), 200);
                return;
            }

            // Verificar se o material está realmente disponível
            const materialComponent = this.el.components.material;
            if (!materialComponent || !materialComponent.material) {
                console.warn('Material ainda não disponível, tentando novamente...');
                setTimeout(() => this.applyPhysics(data), 100);
                return;
            }

            // Aplicar física baseada no tipo
            if (data.type === 'static') {
                this.el.setAttribute('static-body', {
                    shape: data.shape
                });
            } else if (data.type === 'dynamic') {
                this.el.setAttribute('dynamic-body', {
                    mass: data.mass,
                    shape: data.shape
                });
            }

            console.log('✅ Física aplicada com segurança:', this.el.tagName, data.type, data.shape);
            
        } catch (error) {
            console.warn('Erro ao aplicar física, tentando novamente:', error.message);
            // Tentar novamente após um tempo maior
            setTimeout(() => this.applyPhysics(data), 500);
        }
    },

    remove: function() {
        // Limpar física ao remover componente
        if (this.el.hasAttribute('static-body')) {
            this.el.removeAttribute('static-body');
        }
        if (this.el.hasAttribute('dynamic-body')) {
            this.el.removeAttribute('dynamic-body');
        }
    }
});

console.log('🔧 Safe Physics Component carregado');