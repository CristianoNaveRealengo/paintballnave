const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// Configurações de segurança e performance
app.use(
	helmet({
		contentSecurityPolicy: false, // Necessário para A-Frame
	})
);
app.use(compression());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Estado do jogo
const gameState = {
	players: new Map(),
	projectiles: [],
	healthPacks: [
		{
			id: "health1",
			position: { x: 12, y: 1, z: 12 },
			active: true,
			respawnTime: 0,
		},
		{
			id: "health2",
			position: { x: -12, y: 1, z: -12 },
			active: true,
			respawnTime: 0,
		},
	],
	specialWeapon: {
		position: { x: 0, y: 1.5, z: 0 },
		active: true,
		respawnTime: 0,
		type: "sniper",
	},
	gameTime: 300, // 5 minutos em segundos
	gameActive: false,
	gameStartTime: null,
};

// Posições de spawn
const spawnPositions = [
	{ x: 20, y: 1.6, z: 20 },
	{ x: -20, y: 1.6, z: -20 },
	{ x: 20, y: 1.6, z: -20 },
	{ x: -20, y: 1.6, z: 20 },
];

// Função para obter posição de spawn disponível
function getAvailableSpawn() {
	const usedSpawns = Array.from(gameState.players.values()).map(
		(p) => p.spawnIndex
	);
	for (let i = 0; i < spawnPositions.length; i++) {
		if (!usedSpawns.includes(i)) {
			return { position: spawnPositions[i], index: i };
		}
	}
	// Se todos estão ocupados, usar posição aleatória
	const randomIndex = Math.floor(Math.random() * spawnPositions.length);
	return { position: spawnPositions[randomIndex], index: randomIndex };
}

// Função para iniciar o jogo
function startGame() {
	if (gameState.players.size >= 2 && !gameState.gameActive) {
		gameState.gameActive = true;
		gameState.gameStartTime = Date.now();
		gameState.gameTime = 300; // Reset para 5 minutos

		console.log(
			"🎮 Jogo iniciado com",
			gameState.players.size,
			"jogadores"
		);
		io.emit("gameStarted", {
			duration: gameState.gameTime,
			players: Array.from(gameState.players.values()),
		});

		// Timer do jogo
		const gameTimer = setInterval(() => {
			gameState.gameTime--;

			if (gameState.gameTime <= 0) {
				endGame();
				clearInterval(gameTimer);
			} else {
				io.emit("timeUpdate", gameState.gameTime);
			}
		}, 1000);
	}
}

// Função para finalizar o jogo
function endGame() {
	gameState.gameActive = false;

	// Calcular vencedor
	const players = Array.from(gameState.players.values());
	const winner = players.reduce((prev, current) =>
		prev.score > current.score ? prev : current
	);

	console.log(
		"🏆 Jogo finalizado! Vencedor:",
		winner.name,
		"com",
		winner.score,
		"pontos"
	);

	io.emit("gameEnded", {
		winner: winner,
		finalScores: players.map((p) => ({ name: p.name, score: p.score })),
	});

	// Reset do estado do jogo após 10 segundos
	setTimeout(() => {
		gameState.players.clear();
		gameState.projectiles = [];
		resetHealthPacks();
		resetSpecialWeapon();
	}, 10000);
}

// Função para resetar health packs
function resetHealthPacks() {
	gameState.healthPacks.forEach((pack) => {
		pack.active = true;
		pack.respawnTime = 0;
	});
	io.emit("healthPacksUpdate", gameState.healthPacks);
}

// Função para resetar arma especial
function resetSpecialWeapon() {
	gameState.specialWeapon.active = true;
	gameState.specialWeapon.respawnTime = 0;
	io.emit("specialWeaponUpdate", gameState.specialWeapon);
}

// Conexões Socket.io
io.on("connection", (socket) => {
	console.log("👤 Jogador conectado:", socket.id);

	// Jogador entra no jogo
	socket.on("joinGame", (playerData) => {
		const spawn = getAvailableSpawn();

		// Cores de tinta disponíveis para paintball
		const paintColors = [
			"#FF0066", // Rosa/Magenta
			"#0066FF", // Azul
			"#00FF66", // Verde
			"#FF6600", // Laranja
			"#6600FF", // Roxo
			"#FFFF00", // Amarelo
			"#FF0000", // Vermelho
			"#00FFFF", // Ciano
		];

		const player = {
			id: socket.id,
			name: playerData.name || `Jogador ${socket.id.substring(0, 6)}`,
			position: spawn.position,
			rotation: { x: 0, y: 0, z: 0 },
			health: 100,
			score: 0,
			hits: 0, // Contador de acertos
			weapon: "pistol",
			spawnIndex: spawn.index,
			team: gameState.players.size % 2 === 0 ? "blue" : "red", // Times alternados
			paintColor:
				paintColors[gameState.players.size % paintColors.length], // Cor única para cada jogador
			originalColor:
				paintColors[gameState.players.size % paintColors.length],
			paintHits: [], // Array para armazenar onde foi atingido por tinta
		};

		gameState.players.set(socket.id, player);

		// Enviar estado inicial para o jogador
		socket.emit("playerJoined", {
			player: player,
			gameState: {
				players: Array.from(gameState.players.values()),
				healthPacks: gameState.healthPacks,
				specialWeapon: gameState.specialWeapon,
				gameActive: gameState.gameActive,
				gameTime: gameState.gameTime,
			},
		});

		// Notificar outros jogadores
		socket.broadcast.emit("playerConnected", player);

		console.log(`✅ ${player.name} entrou no jogo (Time: ${player.team})`);

		// Tentar iniciar o jogo se houver jogadores suficientes
		if (gameState.players.size >= 2) {
			setTimeout(() => startGame(), 2000); // Delay de 2 segundos
		}
	});

	// Atualização de posição do jogador
	socket.on("playerMove", (data) => {
		const player = gameState.players.get(socket.id);
		if (player && gameState.gameActive) {
			player.position = data.position;
			player.rotation = data.rotation;

			// Broadcast para outros jogadores
			socket.broadcast.emit("playerMoved", {
				playerId: socket.id,
				position: data.position,
				rotation: data.rotation,
			});
		}
	});

	// Disparo de projétil
	socket.on("shoot", (data) => {
		const player = gameState.players.get(socket.id);
		if (player && gameState.gameActive) {
			const projectile = {
				id: `proj_${Date.now()}_${Math.random()}`,
				playerId: socket.id,
				position: data.position,
				direction: data.direction,
				speed: data.weapon === "sniper" ? 100 : 50,
				damage: data.weapon === "sniper" ? 50 : 25,
				weapon: data.weapon || "pistol",
				paintColor: player.paintColor, // Cor da tinta do jogador
				timestamp: Date.now(),
			};

			gameState.projectiles.push(projectile);

			// Broadcast do projétil
			io.emit("projectileFired", projectile);

			// Remover projétil após 3 segundos
			setTimeout(() => {
				gameState.projectiles = gameState.projectiles.filter(
					(p) => p.id !== projectile.id
				);
			}, 3000);
		}
	});

	// Acerto de projétil
	socket.on("hit", (data) => {
		const shooter = gameState.players.get(data.shooterId);
		const target = gameState.players.get(data.targetId);

		if (
			shooter &&
			target &&
			gameState.gameActive &&
			shooter.id !== target.id
		) {
			// Aplicar dano
			target.health = Math.max(0, target.health - data.damage);

			// Aplicar tinta no alvo
			if (data.paintColor) {
				target.paintHits.push({
					color: data.paintColor,
					shooterId: shooter.id,
					timestamp: Date.now(),
				});
				// Atualizar cor visual do jogador para a cor da tinta mais recente
				target.paintColor = data.paintColor;
			}

			// Adicionar pontos ao atirador baseado no dano
			const points = Math.floor(data.damage / 5) * 10; // 10 pontos a cada 5 de dano
			shooter.score += points;
			shooter.hits += 1; // Incrementar contador de acertos

			console.log(
				`🎨 ${shooter.name} pintou ${target.name} com ${data.paintColor} (Dano: ${data.damage}, Pontos: +${points})`
			);

			// Notificar jogadores
			io.emit("playerHit", {
				shooterId: shooter.id,
				targetId: target.id,
				damage: data.damage,
				paintColor: data.paintColor,
				targetHealth: target.health,
				targetPaintColor: target.paintColor,
				shooterScore: shooter.score,
				shooterHits: shooter.hits,
				points: points,
			});

			// Se o jogador morreu, respawn após 3 segundos
			if (target.health <= 0) {
				console.log(
					`💀 ${target.name} foi eliminado por ${shooter.name}`
				);
				shooter.score += 50; // Bônus por eliminação

				setTimeout(() => {
					if (gameState.players.has(target.id)) {
						target.health = 100;
						const newSpawn = getAvailableSpawn();
						target.position = newSpawn.position;
						target.spawnIndex = newSpawn.index;

						io.emit("playerRespawned", {
							playerId: target.id,
							position: target.position,
							health: target.health,
						});
					}
				}, 3000);
			}
		}
	});

	// Coleta de health pack
	socket.on("collectHealthPack", (data) => {
		const player = gameState.players.get(socket.id);
		const healthPack = gameState.healthPacks.find(
			(pack) => pack.id === data.packId
		);

		if (player && healthPack && healthPack.active && player.health < 100) {
			const healAmount = Math.min(25, 100 - player.health);
			player.health += healAmount;

			healthPack.active = false;
			healthPack.respawnTime = Date.now() + 15000; // Respawn em 15 segundos

			console.log(
				`❤️ ${player.name} coletou health pack (+${healAmount} HP)`
			);

			io.emit("healthPackCollected", {
				playerId: socket.id,
				packId: data.packId,
				newHealth: player.health,
			});

			// Respawn do health pack
			setTimeout(() => {
				healthPack.active = true;
				io.emit("healthPackRespawned", healthPack.id);
			}, 15000);
		}
	});

	// Coleta de arma especial
	socket.on("collectSpecialWeapon", () => {
		const player = gameState.players.get(socket.id);

		if (player && gameState.specialWeapon.active) {
			player.weapon = gameState.specialWeapon.type;
			gameState.specialWeapon.active = false;
			gameState.specialWeapon.respawnTime = Date.now() + 30000; // Respawn em 30 segundos

			console.log(
				`🔫 ${player.name} coletou arma especial: ${gameState.specialWeapon.type}`
			);

			io.emit("specialWeaponCollected", {
				playerId: socket.id,
				weapon: gameState.specialWeapon.type,
			});

			// Respawn da arma especial
			setTimeout(() => {
				gameState.specialWeapon.active = true;
				io.emit("specialWeaponRespawned", gameState.specialWeapon);
			}, 30000);
		}
	});

	// Desconexão do jogador
	socket.on("disconnect", () => {
		const player = gameState.players.get(socket.id);
		if (player) {
			console.log(`👋 ${player.name} desconectou`);
			gameState.players.delete(socket.id);

			// Notificar outros jogadores
			socket.broadcast.emit("playerDisconnected", socket.id);

			// Se não há jogadores suficientes, pausar o jogo
			if (gameState.players.size < 2 && gameState.gameActive) {
				gameState.gameActive = false;
				io.emit("gamePaused", "Aguardando mais jogadores...");
			}
		}
	});
});

// Rota principal
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

// Rota de status
app.get("/status", (req, res) => {
	res.json({
		players: gameState.players.size,
		gameActive: gameState.gameActive,
		gameTime: gameState.gameTime,
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`🚀 Servidor Paintball VR rodando na porta ${PORT}`);
	console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("🛑 Servidor sendo finalizado...");
	server.close(() => {
		console.log("✅ Servidor finalizado com sucesso");
		process.exit(0);
	});
});
