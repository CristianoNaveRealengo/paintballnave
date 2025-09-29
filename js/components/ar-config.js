/**
 * AR Configuration - Configurações específicas para Realidade Aumentada
 *
 * Este arquivo contém todas as configurações otimizadas para AR no Meta Quest 3:
 * - Ajustes de transparência e visibilidade
 * - Configurações de performance para AR
 * - Adaptações de UI para passthrough
 * - Configurações de iluminação e sombras
 */

// Configurações globais para AR
window.AR_CONFIG = {
	// Configurações de dispositivo
	device: {
		targetDevice: "meta-quest-3",
		supportedFeatures: [
			"hand-tracking",
			"plane-detection",
			"anchors",
			"hit-test",
			"light-estimation",
		],
		preferredReferenceSpace: "local",
		passthrough: true,
	},

	// Configurações visuais para AR
	visual: {
		// Transparência dos elementos da arena
		arena: {
			groundOpacity: 0.3,
			wallOpacity: 0.6,
			obstacleOpacity: 0.7,
			scale: 0.5, // Arena 50% menor para AR
		},

		// Configurações de materiais
		materials: {
			enableEmissive: true,
			emissiveIntensity: 0.2,
			enableTransparency: true,
			shadowIntensity: 0.5,
		},

		// Configurações de iluminação
		lighting: {
			useEnvironmentLighting: true,
			ambientIntensity: 0.6,
			directionalIntensity: 0.8,
			shadowQuality: "medium", // low, medium, high
		},

		// Configurações de UI
		ui: {
			hudOpacity: 0.8,
			hudScale: 0.8,
			backgroundColor: "#000000",
			backgroundOpacity: 0.7,
			textColor: "#FFFFFF",
			accentColor: "#00FF00",
		},
	},

	// Configurações de performance
	performance: {
		targetFrameRate: 72, // Quest 3 native refresh rate
		renderScale: 1.0,
		shadowMapSize: 1024,
		maxParticles: 50,
		cullingDistance: 20,
		lodLevels: 3,
	},

	// Configurações de interação
	interaction: {
		handTracking: {
			enabled: true,
			gestureThreshold: 0.8,
			hapticFeedback: true,
			hapticIntensity: 0.5,
			raycastDistance: 10,
		},

		gestures: {
			shoot: "point",
			reload: "fist",
			interact: "pinch",
			menu: "peace",
			confirm: "thumbsUp",
		},

		controllers: {
			fallbackToControllers: true,
			showControllerModels: false, // Preferir hand tracking
			controllerOpacity: 0.5,
		},
	},

	// Configurações de áudio
	audio: {
		spatialAudio: true,
		masterVolume: 0.8,
		effectsVolume: 0.7,
		musicVolume: 0.3,
		useEnvironmentReverb: true,
	},

	// Configurações de rede
	network: {
		enableMultiplayer: true,
		maxPlayers: 4, // Reduzido para AR
		updateRate: 20, // Hz
		compressionLevel: "medium",
	},

	// Configurações de segurança para AR
	safety: {
		boundaryWarnings: true,
		obstacleDetection: true,
		playAreaSize: { min: 2.0, recommended: 3.0 }, // metros
		heightWarnings: true,
	},
};

/**
 * Aplica configurações AR automaticamente baseadas no ambiente
 */
function applyARConfiguration() {
	console.log("🔧 Aplicando configurações AR para Meta Quest 3...");

	// Verificar se estamos em AR
	if (!isARSupported()) {
		console.warn("⚠️ AR não suportado, usando configurações VR padrão");
		return false;
	}

	// Aplicar configurações visuais
	applyVisualSettings();

	// Aplicar configurações de performance
	applyPerformanceSettings();

	// Aplicar configurações de interação
	applyInteractionSettings();

	// Aplicar configurações de áudio
	applyAudioSettings();

	console.log("✅ Configurações AR aplicadas com sucesso");
	return true;
}

/**
 * Verifica se AR é suportado no dispositivo atual
 */
function isARSupported() {
	return (
		navigator.xr &&
		navigator.xr.isSessionSupported &&
		navigator.xr.isSessionSupported("immersive-ar")
	);
}

/**
 * Aplica configurações visuais específicas para AR
 */
function applyVisualSettings() {
	const config = AR_CONFIG.visual;

	// Configurar transparência da arena
	const arenaElements = document.querySelectorAll(".ar-arena-element");
	arenaElements.forEach((element) => {
		const material = element.getAttribute("material") || {};
		material.transparent = true;

		if (element.id === "ground") {
			material.opacity = config.arena.groundOpacity;
		} else if (element.id.includes("wall")) {
			material.opacity = config.arena.wallOpacity;
		} else {
			material.opacity = config.arena.obstacleOpacity;
		}

		// Adicionar emissive se habilitado
		if (config.materials.enableEmissive && !material.emissive) {
			material.emissive = material.color || "#FFFFFF";
			material.emissiveIntensity = config.materials.emissiveIntensity;
		}

		element.setAttribute("material", material);
	});

	// Configurar escala da arena
	const arena = document.getElementById("arena");
	if (arena) {
		const scale = config.arena.scale;
		arena.setAttribute("scale", `${scale} ${scale} ${scale}`);
	}

	// Configurar background transparente
	const scene = document.querySelector("a-scene");
	if (scene) {
		scene.setAttribute("background", "transparent: true");
	}
}

/**
 * Aplica configurações de performance para AR
 */
function applyPerformanceSettings() {
	const config = AR_CONFIG.performance;

	// Configurar qualidade de sombras
	const scene = document.querySelector("a-scene");
	if (scene) {
		scene.setAttribute("shadow", {
			type: "pcf",
			autoUpdate: true,
			shadowMapHeight: config.shadowMapSize,
			shadowMapWidth: config.shadowMapSize,
		});
	}

	// Configurar renderer
	if (scene.renderer) {
		scene.renderer.setPixelRatio(config.renderScale);
	}
}

/**
 * Aplica configurações de interação para AR
 */
function applyInteractionSettings() {
	const config = AR_CONFIG.interaction;

	// Configurar hand tracking
	const hands = document.querySelectorAll("[quest-hand-tracking]");
	hands.forEach((hand) => {
		const handConfig = hand.getAttribute("quest-hand-tracking") || {};
		handConfig.gestureThreshold = config.handTracking.gestureThreshold;
		handConfig.hapticFeedback = config.handTracking.hapticFeedback;
		handConfig.hapticIntensity = config.handTracking.hapticIntensity;

		hand.setAttribute("quest-hand-tracking", handConfig);
	});

	// Configurar raycasters
	const raycasters = document.querySelectorAll("[raycaster]");
	raycasters.forEach((raycaster) => {
		const rayConfig = raycaster.getAttribute("raycaster") || {};
		rayConfig.far = config.handTracking.raycastDistance;
		raycaster.setAttribute("raycaster", rayConfig);
	});
}

/**
 * Aplica configurações de áudio para AR
 */
function applyAudioSettings() {
	const config = AR_CONFIG.audio;

	// Configurar áudio espacial
	const audioElements = document.querySelectorAll("[sound]");
	audioElements.forEach((audio) => {
		const soundConfig = audio.getAttribute("sound") || {};
		soundConfig.volume = soundConfig.volume * config.masterVolume;
		soundConfig.positional = config.spatialAudio;
		audio.setAttribute("sound", soundConfig);
	});
}

/**
 * Monitora mudanças de modo (VR/AR) e ajusta configurações
 */
function setupModeMonitoring() {
	const scene = document.querySelector("a-scene");

	scene.addEventListener("enter-vr", () => {
		console.log("🥽 Entrando em modo VR/AR");

		// Detectar se é AR ou VR
		if (
			scene.xrSession &&
			scene.xrSession.environmentBlendMode === "additive"
		) {
			console.log("🌍 Modo AR detectado");
			applyARConfiguration();
		} else {
			console.log("🎮 Modo VR detectado");
			applyVRConfiguration();
		}
	});

	scene.addEventListener("exit-vr", () => {
		console.log("🚪 Saindo do modo VR/AR");
		resetToDesktopConfiguration();
	});
}

/**
 * Aplica configurações para modo VR tradicional
 */
function applyVRConfiguration() {
	console.log("🔧 Aplicando configurações VR...");

	// Restaurar opacidade total
	const arenaElements = document.querySelectorAll(".ar-arena-element");
	arenaElements.forEach((element) => {
		const material = element.getAttribute("material") || {};
		material.opacity = 1.0;
		material.transparent = false;
		element.setAttribute("material", material);
	});

	// Restaurar escala da arena
	const arena = document.getElementById("arena");
	if (arena) {
		arena.setAttribute("scale", "1 1 1");
	}

	// Restaurar background
	const scene = document.querySelector("a-scene");
	if (scene) {
		scene.setAttribute("background", "color: #87CEEB");
	}
}

/**
 * Restaura configurações para modo desktop
 */
function resetToDesktopConfiguration() {
	console.log("🖥️ Aplicando configurações desktop...");
	applyVRConfiguration(); // Usar mesmas configurações do VR
}

/**
 * Utilitário para obter configuração específica
 */
function getARConfig(path) {
	return path.split(".").reduce((obj, key) => obj && obj[key], AR_CONFIG);
}

/**
 * Utilitário para definir configuração específica
 */
function setARConfig(path, value) {
	const keys = path.split(".");
	const lastKey = keys.pop();
	const target = keys.reduce((obj, key) => obj[key], AR_CONFIG);
	target[lastKey] = value;
}

// Inicializar configurações quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
	console.log("📱 Inicializando configurações AR...");

	// Configurar monitoramento de modo
	setupModeMonitoring();

	// Aplicar configurações iniciais se AR estiver disponível
	if (isARSupported()) {
		// Aguardar a cena estar pronta
		const scene = document.querySelector("a-scene");
		if (scene.hasLoaded) {
			applyARConfiguration();
		} else {
			scene.addEventListener("loaded", applyARConfiguration);
		}
	}
});

// Exportar para uso global
window.AR_CONFIG = AR_CONFIG;
window.applyARConfiguration = applyARConfiguration;
window.isARSupported = isARSupported;
window.getARConfig = getARConfig;
window.setARConfig = setARConfig;

console.log("📱 AR Configuration module carregado");
