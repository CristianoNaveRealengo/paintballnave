// Configurações centralizadas do jogo
const GameConfig = {
	// Configurações gerais do jogo
	game: {
		maxPlayers: 4,
		gameDuration: 300, // 5 minutos em segundos
		respawnTime: 3, // segundos
		winCondition: "mostKills", // 'mostKills', 'timeLimit', 'elimination'
		friendlyFire: false,
		autoStart: true,
		minPlayersToStart: 2,
	},

	// Configurações dos jogadores
	player: {
		maxHealth: 100,
		moveSpeed: 3.5,
		jumpHeight: 1.5,
		rotationSpeed: 1.0,
		respawnInvulnerability: 2, // segundos de invulnerabilidade após respawn
		teams: ["blue", "red"],
		defaultTeam: "blue",
	},

	// Configurações das armas (paintball)
	weapons: {
		pistol: {
			name: "Pistola de Tinta",
			damage: 25,
			fireRate: 300, // ms entre tiros
			range: 50,
			accuracy: 0.95,
			ammo: "∞", // Munição infinita de tinta
			reloadTime: 1000, // ms (apenas visual)
			projectileSpeed: 80,
			sound: "pistol-shot",
			muzzleFlash: true,
			paintType: "standard",
		},
		sniper: {
			name: "Sniper de Tinta",
			damage: 50, // Reduzido para paintball
			fireRate: 1500, // ms entre tiros
			range: 100,
			accuracy: 0.98,
			ammo: "∞", // Munição infinita de tinta
			reloadTime: 2000, // ms (apenas visual)
			projectileSpeed: 120,
			sound: "sniper-shot",
			muzzleFlash: true,
			scope: true,
			paintType: "precision",
		},
	},

	// Cores de tinta disponíveis
	paintColors: [
		{ name: "Rosa Neon", hex: "#FF0066", rgb: [255, 0, 102] },
		{ name: "Azul Elétrico", hex: "#0066FF", rgb: [0, 102, 255] },
		{ name: "Verde Limão", hex: "#00FF66", rgb: [0, 255, 102] },
		{ name: "Laranja Vibrante", hex: "#FF6600", rgb: [255, 102, 0] },
		{ name: "Roxo Místico", hex: "#6600FF", rgb: [102, 0, 255] },
		{ name: "Amarelo Solar", hex: "#FFFF00", rgb: [255, 255, 0] },
		{ name: "Vermelho Fogo", hex: "#FF0000", rgb: [255, 0, 0] },
		{ name: "Ciano Cristal", hex: "#00FFFF", rgb: [0, 255, 255] },
	],

	// Configurações dos projéteis (bolas de tinta)
	projectiles: {
		lifetime: 3000, // ms
		gravity: -9.8,
		bounceCount: 0, // Bolas de tinta não quicam
		trailLength: 30, // Rastro mais longo para tinta
		impactEffects: true,
		penetration: false,
		paintSplashRadius: 0.5, // Raio do respingo de tinta
		paintFadeTime: 30000, // Tempo para tinta desaparecer (30s)
	},

	// Configurações da arena
	arena: {
		size: { x: 40, z: 40 },
		wallHeight: 4,
		groundColor: "#4CAF50",
		wallColor: "#8B4513",
		skyColor: "#87CEEB",
		lighting: {
			ambient: 0.4,
			directional: 0.8,
			shadows: true,
		},
	},

	// Posições de spawn dos times
	spawns: {
		blue: [
			{ x: -15, y: 0.5, z: -10 },
			{ x: -15, y: 0.5, z: 10 },
			{ x: -12, y: 0.5, z: 0 },
			{ x: -18, y: 0.5, z: 0 },
		],
		red: [
			{ x: 15, y: 0.5, z: -10 },
			{ x: 15, y: 0.5, z: 10 },
			{ x: 12, y: 0.5, z: 0 },
			{ x: 18, y: 0.5, z: 0 },
		],
	},

	// Configurações dos obstáculos
	obstacles: [
		// Obstáculos centrais
		{
			type: "box",
			position: { x: -5, y: 1, z: -8 },
			size: { x: 2, y: 2, z: 4 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: 5, y: 1, z: -8 },
			size: { x: 2, y: 2, z: 4 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: -5, y: 1, z: 8 },
			size: { x: 2, y: 2, z: 4 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: 5, y: 1, z: 8 },
			size: { x: 2, y: 2, z: 4 },
			color: "#8B4513",
		},

		// Obstáculos laterais
		{
			type: "cylinder",
			position: { x: -12, y: 1.5, z: 0 },
			size: { radius: 1.5, height: 3 },
			color: "#654321",
		},
		{
			type: "cylinder",
			position: { x: 12, y: 1.5, z: 0 },
			size: { radius: 1.5, height: 3 },
			color: "#654321",
		},

		// Obstáculos nos cantos
		{
			type: "box",
			position: { x: -16, y: 0.75, z: -16 },
			size: { x: 1.5, y: 1.5, z: 1.5 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: 16, y: 0.75, z: -16 },
			size: { x: 1.5, y: 1.5, z: 1.5 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: -16, y: 0.75, z: 16 },
			size: { x: 1.5, y: 1.5, z: 1.5 },
			color: "#8B4513",
		},
		{
			type: "box",
			position: { x: 16, y: 0.75, z: 16 },
			size: { x: 1.5, y: 1.5, z: 1.5 },
			color: "#8B4513",
		},

		// Cobertura central
		{
			type: "cylinder",
			position: { x: 0, y: 1, z: 0 },
			size: { radius: 2, height: 2 },
			color: "#696969",
		},
	],

	// Configurações dos health packs
	healthPacks: [
		{
			id: "health1",
			position: { x: -8, y: 0.5, z: -15 },
			healAmount: 50,
			respawnTime: 15000, // ms
			maxHealth: true, // se pode curar além da vida máxima
		},
		{
			id: "health2",
			position: { x: 8, y: 0.5, z: -15 },
			healAmount: 50,
			respawnTime: 15000,
			maxHealth: true,
		},
		{
			id: "health3",
			position: { x: -8, y: 0.5, z: 15 },
			healAmount: 50,
			respawnTime: 15000,
			maxHealth: true,
		},
		{
			id: "health4",
			position: { x: 8, y: 0.5, z: 15 },
			healAmount: 50,
			respawnTime: 15000,
			maxHealth: true,
		},
	],

	// Configurações da arma especial
	specialWeapon: {
		position: { x: 0, y: 0.5, z: 0 },
		weaponType: "sniper",
		respawnTime: 30000, // ms
		duration: 60000, // ms que o jogador mantém a arma
		glowEffect: true,
		announcement: true,
	},

	// Configurações de pontuação
	// Configurações de pontuação (sistema paintball)
	scoring: {
		hitPoints: 10, // Pontos por acerto (baseado no dano)
		killPoints: 50, // Bônus por eliminar jogador
		assistPoints: 15, // Pontos por assistência
		paintBonusMultiplier: 1.2, // Multiplicador por pintar jogador
		streakBonuses: {
			3: 30, // 3 acertos seguidos
			5: 60, // 5 acertos seguidos
			10: 120, // 10 acertos seguidos
		},
		suicidePenalty: -25,
		teamKillPenalty: -50, // Penalidade por atingir aliado
	},

	// Configurações de VR
	vr: {
		enabled: true,
		handTracking: true,
		roomScale: true,
		teleportation: false,
		smoothLocomotion: true,
		snapTurning: false,
		comfort: {
			vignetting: true,
			fadeOnTeleport: true,
			reducedMotion: false,
		},
		controllers: {
			dominant: "right", // 'left' ou 'right'
			hapticFeedback: true,
			vibrationIntensity: 0.8,
		},
	},

	// Configurações de áudio
	audio: {
		masterVolume: 1.0,
		sfxVolume: 0.8,
		musicVolume: 0.6,
		voiceVolume: 1.0,
		spatialAudio: true,
		sounds: {
			"pistol-shot": "assets/sounds/pistol-shot.wav",
			"sniper-shot": "assets/sounds/sniper-shot.wav",
			reload: "assets/sounds/reload.wav",
			"hit-marker": "assets/sounds/hit-marker.wav",
			"health-pickup": "assets/sounds/health-pickup.wav",
			"weapon-pickup": "assets/sounds/weapon-pickup.wav",
			footsteps: "assets/sounds/footsteps.wav",
			ambient: "assets/sounds/ambient.wav",
			victory: "assets/sounds/victory.wav",
			defeat: "assets/sounds/defeat.wav",
		},
	},

	// Configurações de rede
	network: {
		serverUrl: window.location.origin,
		updateRate: 60, // Hz
		interpolation: true,
		prediction: true,
		lagCompensation: true,
		maxPing: 200, // ms
		reconnectAttempts: 5,
		reconnectDelay: 2000, // ms
	},

	// Configurações de performance
	performance: {
		targetFPS: 90, // Para VR
		adaptiveQuality: true,
		maxParticles: 100,
		shadowQuality: "medium", // 'low', 'medium', 'high'
		textureQuality: "high",
		antiAliasing: true,
		postProcessing: {
			bloom: true,
			ssao: false,
			motionBlur: false,
		},
	},

	// Configurações de debug
	debug: {
		enabled: false,
		showFPS: false,
		showPing: false,
		showHitboxes: false,
		showTrajectories: false,
		godMode: false,
		infiniteAmmo: false,
		noReload: false,
	},

	// Configurações da interface
	ui: {
		hudScale: 1.0,
		crosshairStyle: "cross", // 'cross', 'dot', 'circle'
		crosshairColor: "#ff0000",
		healthBarStyle: "bar", // 'bar', 'circle'
		minimapEnabled: true,
		minimapSize: 150, // pixels
		damageIndicators: true,
		killFeed: true,
		scoreboard: true,
	},

	// Configurações de acessibilidade
	accessibility: {
		colorBlindSupport: false,
		highContrast: false,
		largeText: false,
		subtitles: false,
		reducedMotion: false,
		oneHandedMode: false,
	},
};

// Função para obter configuração específica
function getConfig(path) {
	const keys = path.split(".");
	let value = GameConfig;

	for (const key of keys) {
		if (value && typeof value === "object" && key in value) {
			value = value[key];
		} else {
			console.warn(`Configuração não encontrada: ${path}`);
			return null;
		}
	}

	return value;
}

// Função para definir configuração específica
function setConfig(path, newValue) {
	const keys = path.split(".");
	const lastKey = keys.pop();
	let target = GameConfig;

	for (const key of keys) {
		if (!(key in target)) {
			target[key] = {};
		}
		target = target[key];
	}

	target[lastKey] = newValue;
	console.log(`Configuração atualizada: ${path} = ${newValue}`);
}

// Função para carregar configurações do localStorage
function loadUserConfig() {
	try {
		const savedConfig = localStorage.getItem("paintballVR_config");
		if (savedConfig) {
			const userConfig = JSON.parse(savedConfig);

			// Mesclar configurações do usuário com as padrão
			mergeConfig(GameConfig, userConfig);
			console.log("✅ Configurações do usuário carregadas");
		}
	} catch (error) {
		console.warn("⚠️ Erro ao carregar configurações do usuário:", error);
	}
}

// Função para salvar configurações no localStorage
function saveUserConfig() {
	try {
		// Salvar apenas configurações que podem ser alteradas pelo usuário
		const userConfig = {
			audio: GameConfig.audio,
			vr: GameConfig.vr,
			ui: GameConfig.ui,
			accessibility: GameConfig.accessibility,
			performance: {
				shadowQuality: GameConfig.performance.shadowQuality,
				textureQuality: GameConfig.performance.textureQuality,
				antiAliasing: GameConfig.performance.antiAliasing,
			},
		};

		localStorage.setItem("paintballVR_config", JSON.stringify(userConfig));
		console.log("✅ Configurações do usuário salvas");
	} catch (error) {
		console.warn("⚠️ Erro ao salvar configurações do usuário:", error);
	}
}

// Função para mesclar configurações
function mergeConfig(target, source) {
	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			if (
				typeof source[key] === "object" &&
				source[key] !== null &&
				!Array.isArray(source[key])
			) {
				if (!target[key]) target[key] = {};
				mergeConfig(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		}
	}
}

// Função para resetar configurações para o padrão
function resetConfig() {
	localStorage.removeItem("paintballVR_config");
	location.reload(); // Recarregar página para aplicar configurações padrão
}

// Função para validar configurações
function validateConfig() {
	const errors = [];

	// Validar configurações críticas
	if (GameConfig.game.maxPlayers < 2 || GameConfig.game.maxPlayers > 8) {
		errors.push("Número de jogadores deve estar entre 2 e 8");
	}

	if (
		GameConfig.game.gameDuration < 60 ||
		GameConfig.game.gameDuration > 1800
	) {
		errors.push("Duração do jogo deve estar entre 1 e 30 minutos");
	}

	if (GameConfig.player.maxHealth < 50 || GameConfig.player.maxHealth > 500) {
		errors.push("Vida máxima deve estar entre 50 e 500");
	}

	// Validar armas
	for (const weaponName in GameConfig.weapons) {
		const weapon = GameConfig.weapons[weaponName];
		if (weapon.damage < 1 || weapon.damage > 200) {
			errors.push(`Dano da arma ${weaponName} deve estar entre 1 e 200`);
		}
	}

	if (errors.length > 0) {
		console.error("❌ Erros de configuração encontrados:", errors);
		return false;
	}

	console.log("✅ Configurações validadas com sucesso");
	return true;
}

// Função para obter configurações de spawn baseadas no time
function getSpawnPosition(team, playerIndex = 0) {
	const spawns = GameConfig.spawns[team];
	if (!spawns || spawns.length === 0) {
		console.warn(`Spawns não encontrados para o time: ${team}`);
		return { x: 0, y: 0.5, z: 0 };
	}

	// Usar índice do jogador para distribuir spawns
	const spawnIndex = playerIndex % spawns.length;
	return spawns[spawnIndex];
}

// Função para obter configuração de arma
function getWeaponConfig(weaponType) {
	const weapon = GameConfig.weapons[weaponType];
	if (!weapon) {
		console.warn(`Configuração de arma não encontrada: ${weaponType}`);
		return GameConfig.weapons.pistol; // Fallback para pistola
	}
	return weapon;
}

// Função para calcular pontuação
function calculateScore(killType, streak = 0) {
	let points = GameConfig.scoring.killPoints;

	// Aplicar multiplicador de headshot
	if (killType === "headshot") {
		points *= GameConfig.scoring.headShotMultiplier;
	}

	// Aplicar bônus de streak
	for (const streakCount in GameConfig.scoring.streakBonuses) {
		if (streak >= parseInt(streakCount)) {
			points += GameConfig.scoring.streakBonuses[streakCount];
		}
	}

	return Math.round(points);
}

// Carregar configurações do usuário ao inicializar
if (typeof window !== "undefined") {
	window.addEventListener("load", () => {
		loadUserConfig();
		validateConfig();
	});

	// Salvar configurações antes de sair
	window.addEventListener("beforeunload", () => {
		saveUserConfig();
	});
}

// Exportar para uso global
if (typeof window !== "undefined") {
	window.GameConfig = GameConfig;
	window.getConfig = getConfig;
	window.setConfig = setConfig;
	window.saveUserConfig = saveUserConfig;
	window.loadUserConfig = loadUserConfig;
	window.resetConfig = resetConfig;
	window.validateConfig = validateConfig;
	window.getSpawnPosition = getSpawnPosition;
	window.getWeaponConfig = getWeaponConfig;
	window.calculateScore = calculateScore;
}

// Para Node.js (servidor)
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		GameConfig,
		getConfig,
		setConfig,
		getSpawnPosition,
		getWeaponConfig,
		calculateScore,
		validateConfig,
	};
}
