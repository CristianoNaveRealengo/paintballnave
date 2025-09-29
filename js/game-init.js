/**
 * Game Initialization System - Sistema de Inicialização do Jogo
 *
 * Gerencia a inicialização completa do jogo Paint Ball VR:
 * - Detecção de dispositivo (Desktop/VR/AR)
 * - Configuração automática baseada no dispositivo
 * - Inicialização de componentes
 * - Gerenciamento de estado do jogo
 * - Sistema de eventos
 */

class GameInitializer {
	constructor() {
		console.log("🎮 Inicializando Game Initializer...");

		this.gameState = {
			initialized: false,
			deviceType: "desktop", // desktop, vr, ar
			isVRSupported: false,
			isARSupported: false,
			currentMode: "desktop",
			components: {},
			players: [],
			gameMode: "practice", // practice, multiplayer, tournament
			settings: {},
		};

		this.eventListeners = new Map();
		this.initPromise = null;

		// Bind methods
		this.init = this.init.bind(this);
		this.detectDevice = this.detectDevice.bind(this);
		this.setupComponents = this.setupComponents.bind(this);
	}

	/**
	 * Inicialização principal do jogo
	 */
	async init() {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = this._performInit();
		return this.initPromise;
	}

	async _performInit() {
		try {
			console.log("🚀 Iniciando Paint Ball VR...");

			// 1. Detectar dispositivo e capacidades
			await this.detectDevice();

			// 2. Carregar configurações
			await this.loadSettings();

			// 3. Configurar cena baseada no dispositivo
			await this.setupScene();

			// 4. Inicializar componentes
			await this.setupComponents();

			// 5. Configurar controles
			await this.setupControls();

			// 6. Inicializar áudio
			await this.setupAudio();

			// 7. Configurar rede (se multiplayer)
			await this.setupNetwork();

			// 8. Finalizar inicialização
			await this.finalizeInit();

			this.gameState.initialized = true;
			console.log("✅ Paint Ball VR inicializado com sucesso!");

			// Disparar evento de inicialização completa
			this.emit("game:initialized", this.gameState);

			return this.gameState;
		} catch (error) {
			console.error("❌ Erro na inicialização do jogo:", error);
			this.emit("game:error", { error, phase: "initialization" });
			throw error;
		}
	}

	/**
	 * Detectar dispositivo e capacidades WebXR
	 */
	async detectDevice() {
		console.log("🔍 Detectando dispositivo...");

		// Verificar suporte WebXR
		if (navigator.xr) {
			try {
				// Verificar suporte VR
				this.gameState.isVRSupported =
					await navigator.xr.isSessionSupported("immersive-vr");

				// Verificar suporte AR
				this.gameState.isARSupported =
					await navigator.xr.isSessionSupported("immersive-ar");

				console.log(
					`📱 WebXR - VR: ${this.gameState.isVRSupported}, AR: ${this.gameState.isARSupported}`
				);
			} catch (error) {
				console.warn("⚠️ Erro ao verificar suporte WebXR:", error);
			}
		}

		// Detectar tipo de dispositivo
		const userAgent = navigator.userAgent.toLowerCase();

		if (userAgent.includes("quest") || userAgent.includes("oculus")) {
			this.gameState.deviceType = this.gameState.isARSupported
				? "ar"
				: "vr";
			this.gameState.currentMode = this.gameState.deviceType;
		} else if (this.gameState.isVRSupported) {
			this.gameState.deviceType = "vr";
			this.gameState.currentMode = "vr";
		} else {
			this.gameState.deviceType = "desktop";
			this.gameState.currentMode = "desktop";
		}

		console.log(
			`🎯 Dispositivo detectado: ${this.gameState.deviceType}, Modo: ${this.gameState.currentMode}`
		);

		this.emit("device:detected", {
			deviceType: this.gameState.deviceType,
			vrSupported: this.gameState.isVRSupported,
			arSupported: this.gameState.isARSupported,
		});
	}

	/**
	 * Carregar configurações do jogo
	 */
	async loadSettings() {
		console.log("⚙️ Carregando configurações...");

		// Configurações padrão
		const defaultSettings = {
			graphics: {
				quality: "medium",
				shadows: true,
				antialiasing: true,
				frameRate: 60,
			},
			audio: {
				masterVolume: 0.8,
				sfxVolume: 0.7,
				musicVolume: 0.5,
				spatialAudio: true,
			},
			controls: {
				sensitivity: 1.0,
				invertY: false,
				handTracking: true,
				hapticFeedback: true,
			},
			gameplay: {
				difficulty: "normal",
				autoReload: false,
				friendlyFire: false,
				respawnTime: 5,
			},
		};

		// Carregar configurações salvas
		try {
			const savedSettings = localStorage.getItem("paintball-vr-settings");
			if (savedSettings) {
				this.gameState.settings = {
					...defaultSettings,
					...JSON.parse(savedSettings),
				};
			} else {
				this.gameState.settings = defaultSettings;
			}
		} catch (error) {
			console.warn(
				"⚠️ Erro ao carregar configurações salvas, usando padrões:",
				error
			);
			this.gameState.settings = defaultSettings;
		}

		// Ajustar configurações baseadas no dispositivo
		this.adjustSettingsForDevice();

		console.log("✅ Configurações carregadas:", this.gameState.settings);
	}

	/**
	 * Ajustar configurações baseadas no dispositivo
	 */
	adjustSettingsForDevice() {
		const settings = this.gameState.settings;

		switch (this.gameState.deviceType) {
			case "ar":
				// Configurações otimizadas para AR
				settings.graphics.quality = "medium";
				settings.graphics.shadows = false; // Economizar performance
				settings.audio.spatialAudio = true;
				settings.controls.handTracking = true;
				break;

			case "vr":
				// Configurações otimizadas para VR
				settings.graphics.quality = "high";
				settings.graphics.shadows = true;
				settings.audio.spatialAudio = true;
				settings.controls.handTracking = this.gameState.isARSupported;
				break;

			case "desktop":
				// Configurações para desktop
				settings.graphics.quality = "high";
				settings.graphics.shadows = true;
				settings.audio.spatialAudio = false;
				settings.controls.handTracking = false;
				break;
		}
	}

	/**
	 * Configurar cena A-Frame baseada no dispositivo
	 */
	async setupScene() {
		console.log("🎬 Configurando cena...");

		const scene = document.querySelector("a-scene");
		if (!scene) {
			throw new Error("Cena A-Frame não encontrada");
		}

		// Configurar WebXR baseado no dispositivo
		const webxrConfig = {
			requiredFeatures: [],
			optionalFeatures: [],
		};

		if (this.gameState.currentMode === "ar") {
			webxrConfig.requiredFeatures = [
				"local",
				"hit-test",
				"plane-detection",
			];
			webxrConfig.optionalFeatures = [
				"anchors",
				"hand-tracking",
				"light-estimation",
			];

			// Configurar para AR
			scene.setAttribute("background", "transparent", true);
			scene.setAttribute("ar-manager", {
				planeDetection: true,
				autoAnchor: true,
				lightEstimation: true,
			});
		} else if (this.gameState.currentMode === "vr") {
			webxrConfig.requiredFeatures = ["local"];
			webxrConfig.optionalFeatures = ["hand-tracking", "bounded-floor"];
		}

		// Aplicar configuração WebXR
		if (webxrConfig.requiredFeatures.length > 0) {
			scene.setAttribute("webxr", {
				requiredFeatures: webxrConfig.requiredFeatures.join(","),
				optionalFeatures: webxrConfig.optionalFeatures.join(","),
			});
		}

		// Aguardar carregamento completo das bibliotecas antes de configurar física
		setTimeout(() => {
			this.initPhysicsSystem(scene);
		}, 500);
	}

	/**
	 * Inicializar sistema de física
	 */
	initPhysicsSystem(scene) {
		try {
			// Verificar se CANNON está disponível
			if (
				typeof CANNON !== "undefined" ||
				(window.AFRAME && window.AFRAME.physics)
			) {
				scene.setAttribute("physics", {
					driver: "cannon",
					debug: false,
					gravity: "0 -9.8 0",
				});
				console.log("✅ Sistema de física CANNON inicializado");
			} else {
				console.warn(
					"⚠️ CANNON.js não encontrado, tentando novamente..."
				);
				// Tentar novamente após mais tempo
				setTimeout(() => {
					this.initPhysicsSystem(scene);
				}, 1000);
			}
		} catch (error) {
			console.error("Erro ao inicializar física:", error);
		}

		// Aplicar configurações AR se necessário
		if (window.AR_CONFIG && this.gameState.currentMode === "ar") {
			window.AR_CONFIG.applySettings();
		}

		console.log("✅ Cena configurada para:", this.gameState.currentMode);
	}

	/**
	 * Inicializar componentes do jogo
	 */
	async setupComponents() {
		console.log("🔧 Inicializando componentes...");

		const scene = document.querySelector("a-scene");

		// Aguardar cena estar carregada
		if (!scene.hasLoaded) {
			await new Promise((resolve) => {
				scene.addEventListener("loaded", resolve, { once: true });
			});
		}

		// Inicializar componentes baseados no modo
		const componentsToInit = this.getComponentsForMode();

		for (const componentName of componentsToInit) {
			try {
				await this.initComponent(componentName);
				this.gameState.components[componentName] = true;
				console.log(`✅ Componente ${componentName} inicializado`);
			} catch (error) {
				console.error(
					`❌ Erro ao inicializar ${componentName}:`,
					error
				);
				this.gameState.components[componentName] = false;
			}
		}

		console.log("✅ Componentes inicializados:", this.gameState.components);
	}

	/**
	 * Obter lista de componentes para o modo atual
	 */
	getComponentsForMode() {
		const baseComponents = ["vr-hud", "audio-manager"];

		switch (this.gameState.currentMode) {
			case "ar":
				return [...baseComponents, "ar-manager", "quest-hand-tracking"];
			case "vr":
				return [...baseComponents, "hand-controls"];
			case "desktop":
				return [
					...baseComponents,
					"mouse-controls",
					"keyboard-controls",
				];
			default:
				return baseComponents;
		}
	}

	/**
	 * Inicializar componente específico
	 */
	async initComponent(componentName) {
		const scene = document.querySelector("a-scene");

		switch (componentName) {
			case "vr-hud":
				if (!scene.hasAttribute("vr-hud")) {
					scene.setAttribute("vr-hud", {
						enabled: true,
						showHealth: true,
						showAmmo: true,
						showScore: true,
					});
				}
				break;

			case "ar-manager":
				if (!scene.hasAttribute("ar-manager")) {
					scene.setAttribute("ar-manager", {
						planeDetection: true,
						autoAnchor: true,
						lightEstimation: true,
					});
				}
				break;

			case "audio-manager":
				if (window.AudioManager) {
					await window.AudioManager.init();
				}
				break;

			case "quest-hand-tracking":
				// Configurar hand tracking para Quest
				const leftHand = document.querySelector("#leftHand");
				const rightHand = document.querySelector("#rightHand");

				if (leftHand && !leftHand.hasAttribute("quest-hand-tracking")) {
					leftHand.setAttribute("quest-hand-tracking", {
						hand: "left",
					});
				}

				if (
					rightHand &&
					!rightHand.hasAttribute("quest-hand-tracking")
				) {
					rightHand.setAttribute("quest-hand-tracking", {
						hand: "right",
						gestures: "shoot,reload,interact",
					});
				}
				break;

			default:
				console.warn(`⚠️ Componente desconhecido: ${componentName}`);
		}
	}

	/**
	 * Configurar controles baseados no dispositivo
	 */
	async setupControls() {
		console.log("🎮 Configurando controles...");

		const settings = this.gameState.settings.controls;

		switch (this.gameState.currentMode) {
			case "ar":
			case "vr":
				// Configurar controles VR/AR
				await this.setupVRControls();
				break;

			case "desktop":
				// Configurar controles desktop
				await this.setupDesktopControls();
				break;
		}

		console.log("✅ Controles configurados");
	}

	/**
	 * Configurar controles VR/AR
	 */
	async setupVRControls() {
		// Configurar hand tracking se suportado
		if (this.gameState.settings.controls.handTracking) {
			console.log("👋 Configurando hand tracking...");

			// Configurações já aplicadas em setupComponents
		}

		// Configurar haptic feedback
		if (this.gameState.settings.controls.hapticFeedback) {
			console.log("📳 Habilitando haptic feedback...");
		}
	}

	/**
	 * Configurar controles desktop
	 */
	async setupDesktopControls() {
		// Configurar controles de mouse e teclado
		const sensitivity = this.gameState.settings.controls.sensitivity;
		const invertY = this.gameState.settings.controls.invertY;

		// Aplicar configurações aos controles
		const camera = document.querySelector("[camera]");
		if (camera) {
			camera.setAttribute("look-controls", {
				mouseSensitivity: sensitivity,
				invertY: invertY,
			});
		}
	}

	/**
	 * Configurar sistema de áudio
	 */
	async setupAudio() {
		console.log("🔊 Configurando áudio...");

		if (window.AudioManager) {
			const audioSettings = this.gameState.settings.audio;

			await window.AudioManager.init();
			window.AudioManager.setMasterVolume(audioSettings.masterVolume);
			window.AudioManager.setSFXVolume(audioSettings.sfxVolume);
			window.AudioManager.setMusicVolume(audioSettings.musicVolume);

			if (
				audioSettings.spatialAudio &&
				this.gameState.currentMode !== "desktop"
			) {
				window.AudioManager.enableSpatialAudio();
			}
		}

		console.log("✅ Áudio configurado");
	}

	/**
	 * Configurar rede para multiplayer
	 */
	async setupNetwork() {
		console.log("🌐 Configurando rede...");

		if (this.gameState.gameMode === "multiplayer") {
			// Implementar configuração de rede quando necessário
			console.log(
				"🔗 Modo multiplayer detectado - configuração de rede pendente"
			);
		}

		console.log("✅ Rede configurada");
	}

	/**
	 * Finalizar inicialização
	 */
	async finalizeInit() {
		console.log("🏁 Finalizando inicialização...");

		// Executar testes se em modo AR
		if (this.gameState.currentMode === "ar" && window.ARTestUtils) {
			console.log("🧪 Executando testes AR...");
			const testResults = await window.ARTestUtils.runAllTests();
			console.log("📊 Resultados dos testes AR:", testResults);
		}

		// Salvar estado inicial
		this.saveGameState();

		// Configurar listeners de eventos
		this.setupEventListeners();

		console.log("✅ Inicialização finalizada");
	}

	/**
	 * Configurar listeners de eventos
	 */
	setupEventListeners() {
		// Eventos de WebXR
		const scene = document.querySelector("a-scene");

		scene.addEventListener("enter-vr", () => {
			console.log("🥽 Entrando em modo VR");
			this.gameState.currentMode = "vr";
			this.emit("mode:changed", { mode: "vr" });
		});

		scene.addEventListener("exit-vr", () => {
			console.log("🖥️ Saindo do modo VR");
			this.gameState.currentMode = "desktop";
			this.emit("mode:changed", { mode: "desktop" });
		});

		// Eventos de AR (se suportado)
		if (this.gameState.isARSupported) {
			scene.addEventListener("ar-ready", () => {
				console.log("📱 AR pronto");
				this.emit("ar:ready");
			});

			scene.addEventListener("ar-error", (event) => {
				console.error("❌ Erro AR:", event.detail);
				this.emit("ar:error", event.detail);
			});
		}

		// Eventos de performance
		this.setupPerformanceMonitoring();
	}

	/**
	 * Configurar monitoramento de performance
	 */
	setupPerformanceMonitoring() {
		let frameCount = 0;
		let lastTime = performance.now();

		const monitorPerformance = () => {
			frameCount++;
			const currentTime = performance.now();

			if (currentTime - lastTime >= 1000) {
				const fps = Math.round(
					(frameCount * 1000) / (currentTime - lastTime)
				);

				this.emit("performance:fps", { fps });

				// Ajustar qualidade se FPS baixo
				if (
					fps < 30 &&
					this.gameState.settings.graphics.quality !== "low"
				) {
					console.warn(
						"⚠️ FPS baixo detectado, reduzindo qualidade gráfica"
					);
					this.adjustGraphicsQuality("low");
				}

				frameCount = 0;
				lastTime = currentTime;
			}

			requestAnimationFrame(monitorPerformance);
		};

		requestAnimationFrame(monitorPerformance);
	}

	/**
	 * Ajustar qualidade gráfica
	 */
	adjustGraphicsQuality(quality) {
		this.gameState.settings.graphics.quality = quality;

		const scene = document.querySelector("a-scene");
		const renderer = scene.renderer;

		switch (quality) {
			case "low":
				renderer.setPixelRatio(0.5);
				renderer.shadowMap.enabled = false;
				break;
			case "medium":
				renderer.setPixelRatio(0.75);
				renderer.shadowMap.enabled = true;
				break;
			case "high":
				renderer.setPixelRatio(1.0);
				renderer.shadowMap.enabled = true;
				break;
		}

		this.emit("graphics:quality-changed", { quality });
	}

	/**
	 * Salvar estado do jogo
	 */
	saveGameState() {
		try {
			const stateToSave = {
				settings: this.gameState.settings,
				deviceType: this.gameState.deviceType,
				lastPlayed: Date.now(),
			};

			localStorage.setItem(
				"paintball-vr-state",
				JSON.stringify(stateToSave)
			);
		} catch (error) {
			console.warn("⚠️ Erro ao salvar estado do jogo:", error);
		}
	}

	/**
	 * Sistema de eventos
	 */
	on(event, callback) {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, []);
		}
		this.eventListeners.get(event).push(callback);
	}

	off(event, callback) {
		if (this.eventListeners.has(event)) {
			const listeners = this.eventListeners.get(event);
			const index = listeners.indexOf(callback);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	}

	emit(event, data) {
		if (this.eventListeners.has(event)) {
			this.eventListeners.get(event).forEach((callback) => {
				try {
					callback(data);
				} catch (error) {
					console.error(
						`Erro no listener do evento ${event}:`,
						error
					);
				}
			});
		}
	}

	/**
	 * Métodos públicos para controle do jogo
	 */
	getGameState() {
		return { ...this.gameState };
	}

	isInitialized() {
		return this.gameState.initialized;
	}

	getCurrentMode() {
		return this.gameState.currentMode;
	}

	getSettings() {
		return { ...this.gameState.settings };
	}

	updateSettings(newSettings) {
		this.gameState.settings = {
			...this.gameState.settings,
			...newSettings,
		};
		this.saveGameState();
		this.emit("settings:updated", this.gameState.settings);
	}

	/**
	 * Reiniciar jogo
	 */
	async restart() {
		console.log("🔄 Reiniciando jogo...");

		this.gameState.initialized = false;
		this.initPromise = null;

		// Limpar listeners
		this.eventListeners.clear();

		// Reinicializar
		return this.init();
	}

	/**
	 * Destruir instância
	 */
	destroy() {
		console.log("🗑️ Destruindo Game Initializer...");

		this.eventListeners.clear();
		this.gameState.initialized = false;
		this.initPromise = null;
	}
}

// Criar instância global
window.GameInitializer = new GameInitializer();

// Auto-inicializar quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", async () => {
	try {
		await window.GameInitializer.init();
	} catch (error) {
		console.error("❌ Falha na inicialização automática:", error);
	}
});

console.log("🎮 Game Initialization System carregado");
