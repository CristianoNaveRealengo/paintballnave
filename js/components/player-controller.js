// Componente de controle do jogador VR
AFRAME.registerComponent("player-controller", {
	schema: {
		speed: { type: "number", default: 5 },
		jumpHeight: { type: "number", default: 3 },
		health: { type: "number", default: 100 },
		team: { type: "string", default: "blue" },
	},

	init: function () {
		this.player = {
			id: "player_" + Date.now(), // ID temporário até conectar ao servidor
			health: this.data.health,
			score: 0,
			weapon: "pistol",
			team: this.data.team,
			isMoving: false,
			lastPosition: { x: 0, y: 0, z: 0 },
			lastRotation: { x: 0, y: 0, z: 0 },
			paintColor: this.data.team === "blue" ? "#0066FF" : "#FF0066", // Cor inicial baseada no time
			paintHits: [], // Array para armazenar onde foi atingido por tinta
			originalColor: this.data.team === "blue" ? "#0066FF" : "#FF0066",
		};

		this.keys = {};
		this.setupEventListeners();
		this.setupVRControls();

		// Aguardar network manager estar pronto
		setTimeout(() => {
			if (window.networkManager && window.networkManager.playerId) {
				this.player.id = window.networkManager.playerId;
				console.log("🎮 Player ID atualizado:", this.player.id);
			}
		}, 1000);

		console.log("🎮 Player Controller inicializado");
	},

	setupEventListeners: function () {
		// Eventos de teclado para desktop
		document.addEventListener("keydown", (e) => {
			this.keys[e.code] = true;
			this.handleKeyInput(e);
		});

		document.addEventListener("keyup", (e) => {
			this.keys[e.code] = false;
		});

		// Eventos de mouse para desktop
		document.addEventListener("click", (e) => {
			// Permitir disparos mesmo sem pointer lock para melhor experiência
			// Verificar se o clique foi na área do jogo (não em UI)
			if (!e.target.closest('.ui-element') && !e.target.closest('button')) {
				this.handleShoot();
			}
		});

		// Evento adicional para mousedown como backup
		document.addEventListener("mousedown", (e) => {
			// Apenas botão esquerdo do mouse
			if (e.button === 0 && !e.target.closest('.ui-element') && !e.target.closest('button')) {
				this.handleShoot();
			}
		});

		// Eventos VR
		this.el.addEventListener("triggerdown", () => {
			this.handleShoot();
		});

		this.el.addEventListener("gripdown", () => {
			this.handleReload();
		});

		// Eventos de colisão
		this.el.addEventListener("collide", (e) => {
			this.handleCollision(e.detail.target);
		});
	},

	setupVRControls: function () {
		// Configurar controles específicos do Meta Quest 3
		const camera = this.el.querySelector("#playerCamera");
		if (camera) {
			// Configurações de movimento suave
			camera.setAttribute("look-controls", {
				"pointer-lock-enabled": true,
				"touch-enabled": true,
				"magnet-enabled": true,
			});

			// Configurações de movimento WASD
			camera.setAttribute("wasd-controls", {
				acceleration: 20,
				fly: false,
				enabled: true,
			});
		}
	},

	handleKeyInput: function (event) {
		switch (event.code) {
			case "Space":
				event.preventDefault();
				this.handleJump();
				break;
			case "KeyR":
				this.handleReload();
				break;
			case "KeyE":
				this.handleInteract();
				break;
			case "Tab":
				event.preventDefault();
				this.showScoreboard();
				break;
		}
	},

	handleShoot: function () {
		const camera = this.el.querySelector("#camera");
		if (!camera) {
			console.warn("Câmera não encontrada para disparo");
			return;
		}

		// Obter posição e direção do disparo
		const cameraPosition = camera.getAttribute("position");
		const cameraRotation = camera.getAttribute("rotation");
		const playerPosition = this.el.getAttribute("position");

		// Calcular posição absoluta do disparo
		const shootPosition = {
			x: playerPosition.x + cameraPosition.x,
			y: playerPosition.y + cameraPosition.y,
			z: playerPosition.z + cameraPosition.z,
		};

		// Calcular direção baseada na rotação da câmera
		const direction = this.calculateShootDirection(cameraRotation);

		// Dados do disparo
		const shootData = {
			id: `shot_${Date.now()}_${Math.random()}`,
			position: shootPosition,
			direction: direction,
			weapon: this.player.weapon,
			playerId: this.player.id || "local",
			timestamp: Date.now(),
		};

		// Criar projétil localmente
		const weaponSystem = this.el.components["weapon-system"];
		if (weaponSystem) {
			weaponSystem.createProjectile(shootData);
		}

		// Enviar disparo para o servidor
		if (window.networkManager) {
			window.networkManager.shoot(shootData);
		}

		// Efeitos visuais e sonoros locais
		this.createMuzzleFlash();
		this.playShootSound();
		this.addRecoil();

		console.log("🔫 Disparo realizado:", shootData);
	},

	calculateShootDirection: function (rotation) {
		// Converter rotação em radianos
		const pitch = THREE.MathUtils.degToRad(rotation.x);
		const yaw = THREE.MathUtils.degToRad(rotation.y);

		// Calcular vetor de direção
		return {
			x: Math.sin(yaw) * Math.cos(pitch),
			y: -Math.sin(pitch),
			z: -Math.cos(yaw) * Math.cos(pitch),
		};
	},

	createMuzzleFlash: function () {
		const weapon = this.el.querySelector("#weapon");
		if (!weapon) return;

		// Criar flash visual
		const flash = document.createElement("a-sphere");
		flash.setAttribute("radius", "0.1");
		flash.setAttribute("color", "#ffff00");
		flash.setAttribute("position", "0 0 -0.4");
		flash.setAttribute("animation", {
			property: "scale",
			from: "1 1 1",
			to: "0 0 0",
			dur: 100,
			easing: "easeOutQuad",
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
		const shootSound = document.querySelector("#shootSound");
		if (shootSound) {
			shootSound.currentTime = 0;
			shootSound
				.play()
				.catch((e) => console.log("Erro ao tocar som:", e));
		}
	},

	addRecoil: function () {
		const camera = this.el.querySelector("#playerCamera");
		if (!camera) return;

		// Adicionar recuo visual
		const currentRotation = camera.getAttribute("rotation");
		const recoilAmount = this.player.weapon === "sniper" ? 2 : 1;

		camera.setAttribute("animation__recoil", {
			property: "rotation",
			from: `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`,
			to: `${currentRotation.x - recoilAmount} ${currentRotation.y} ${
				currentRotation.z
			}`,
			dur: 50,
			dir: "alternate",
			easing: "easeOutQuad",
		});
	},

	handleJump: function () {
		const rigidBody = this.el.getAttribute("dynamic-body");
		if (rigidBody) {
			// Aplicar força de pulo
			this.el.body.velocity.y = this.data.jumpHeight;
		}
	},

	handleReload: function () {
		console.log("🔄 Recarregando arma...");

		// Tocar som de recarga
		const reloadSound = document.querySelector("#reloadSound");
		if (reloadSound) {
			reloadSound.currentTime = 0;
			reloadSound
				.play()
				.catch((e) => console.log("Erro ao tocar som:", e));
		}

		// Animação de recarga
		const weapon = this.el.querySelector("#weapon");
		if (weapon) {
			weapon.setAttribute("animation__reload", {
				property: "rotation",
				from: "0 0 0",
				to: "0 0 -30",
				dur: 500,
				dir: "alternate",
				easing: "easeInOutQuad",
			});
		}
	},

	handleInteract: function () {
		// Verificar interações próximas (health packs, armas especiais)
		const position = this.el.getAttribute("position");

		// Verificar health packs
		const healthPacks = document.querySelectorAll("[health-pack]");
		healthPacks.forEach((pack) => {
			const packPosition = pack.getAttribute("position");
			const distance = this.calculateDistance(position, packPosition);

			if (distance < 2) {
				this.collectHealthPack(pack);
			}
		});

		// Verificar arma especial
		const specialWeapon = document.querySelector("[special-weapon]");
		if (specialWeapon) {
			const weaponPosition = specialWeapon.getAttribute("position");
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
		if (target.classList.contains("projectile")) {
			const projectileData = target.components.projectile;
			if (
				projectileData &&
				projectileData.data.playerId !== this.player.id
			) {
				this.takeDamage(
					projectileData.data.damage,
					projectileData.data.playerId
				);
			}
		}
	},

	takeDamage: function (damage, shooterId, paintColor) {
		this.player.health = Math.max(0, this.player.health - damage);

		// Aplicar tinta no jogador
		if (paintColor) {
			this.applyPaint(paintColor, shooterId);
		}

		// Efeito visual de dano
		this.showDamageEffect();

		// Som de acerto
		const hitSound = document.querySelector("#hit-marker");
		if (hitSound) {
			hitSound.currentTime = 0;
			hitSound.play().catch((e) => console.log("Erro ao tocar som:", e));
		}

		// Notificar servidor
		if (window.networkManager) {
			window.networkManager.reportHit({
				targetId: this.player.id,
				shooterId: shooterId,
				damage: damage,
				paintColor: paintColor,
			});
		}

		console.log(
			`🎨 Recebeu ${damage} de dano com tinta ${paintColor}. Vida: ${this.player.health}`
		);
	},

	applyPaint: function (paintColor, shooterId) {
		// Adicionar hit de tinta
		this.player.paintHits.push({
			color: paintColor,
			shooterId: shooterId,
			timestamp: Date.now(),
		});

		// Atualizar cor do jogador baseada na tinta mais recente
		this.player.paintColor = paintColor;

		// Atualizar visual do jogador
		this.updatePlayerVisual();

		console.log(`🎨 Jogador pintado com cor: ${paintColor}`);
	},

	updatePlayerVisual: function () {
		// Atualizar cor do corpo do jogador
		const playerBody = this.el.querySelector(".player-body");
		if (playerBody) {
			playerBody.setAttribute(
				"material",
				"color",
				this.player.paintColor
			);
		}

		// Se for o jogador local, atualizar indicadores visuais
		if (this.player.id === window.networkManager?.playerId) {
			this.updateLocalPlayerVisual();
		}
	},

	updateLocalPlayerVisual: function () {
		// Atualizar indicador de cor no HUD
		const colorIndicator = document.querySelector(
			"#player-color-indicator"
		);
		if (colorIndicator) {
			colorIndicator.setAttribute(
				"material",
				"color",
				this.player.paintColor
			);
		}

		// Criar efeito visual de mudança de cor
		this.createColorChangeEffect();
	},

	createColorChangeEffect: function () {
		const camera = this.el.querySelector("#camera");
		if (!camera) return;

		// Criar overlay colorido temporário
		const colorOverlay = document.createElement("a-plane");
		colorOverlay.setAttribute("position", "0 0 -0.8");
		colorOverlay.setAttribute("width", "2");
		colorOverlay.setAttribute("height", "1.5");
		colorOverlay.setAttribute("material", {
			color: this.player.paintColor,
			transparent: true,
			opacity: 0.4,
		});
		colorOverlay.setAttribute("animation", {
			property: "material.opacity",
			from: "0.4",
			to: "0",
			dur: 1000,
			easing: "easeOutQuad",
		});

		camera.appendChild(colorOverlay);

		// Remover overlay após animação
		setTimeout(() => {
			if (colorOverlay.parentNode) {
				colorOverlay.parentNode.removeChild(colorOverlay);
			}
		}, 1100);
	},

	showDamageEffect: function () {
		const camera = this.el.querySelector("#playerCamera");
		if (!camera) return;

		// Criar overlay vermelho
		const damageOverlay = document.createElement("a-plane");
		damageOverlay.setAttribute("position", "0 0 -1");
		damageOverlay.setAttribute("width", "4");
		damageOverlay.setAttribute("height", "3");
		damageOverlay.setAttribute("color", "red");
		damageOverlay.setAttribute("opacity", "0.3");
		damageOverlay.setAttribute("animation", {
			property: "opacity",
			from: "0.3",
			to: "0",
			dur: 500,
			easing: "easeOutQuad",
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
		console.log("📊 Scoreboard solicitado");
		// TODO: Implementar interface de scoreboard
	},

	tick: function () {
		// Verificar movimento para sincronização multiplayer
		const currentPosition = this.el.getAttribute("position");
		const currentRotation = this.el.getAttribute("rotation");

		const positionChanged = this.hasPositionChanged(
			currentPosition,
			this.player.lastPosition
		);
		const rotationChanged = this.hasRotationChanged(
			currentRotation,
			this.player.lastRotation
		);

		if (positionChanged || rotationChanged) {
			// Enviar atualização de posição para o servidor
			if (window.networkManager) {
				window.networkManager.updatePosition({
					position: currentPosition,
					rotation: currentRotation,
				});
			}

			this.player.lastPosition = { ...currentPosition };
			this.player.lastRotation = { ...currentRotation };
		}
	},

	hasPositionChanged: function (current, last) {
		const threshold = 0.1;
		return (
			Math.abs(current.x - last.x) > threshold ||
			Math.abs(current.y - last.y) > threshold ||
			Math.abs(current.z - last.z) > threshold
		);
	},

	hasRotationChanged: function (current, last) {
		const threshold = 1;
		return (
			Math.abs(current.x - last.x) > threshold ||
			Math.abs(current.y - last.y) > threshold ||
			Math.abs(current.z - last.z) > threshold
		);
	},

	updateHealth: function (newHealth) {
		this.player.health = newHealth;

		// Atualizar HUD
		const healthText = document.querySelector("#healthText");
		if (healthText) {
			healthText.setAttribute("value", `VIDA: ${this.player.health}`);

			// Mudar cor baseada na vida
			if (this.player.health < 30) {
				healthText.setAttribute("color", "red");
			} else if (this.player.health < 60) {
				healthText.setAttribute("color", "orange");
			} else {
				healthText.setAttribute("color", "green");
			}
		}
	},

	updateScore: function (newScore) {
		this.player.score = newScore;

		// Atualizar HUD
		const scoreText = document.querySelector("#score-text");
		if (scoreText) {
			scoreText.setAttribute("value", `Pontos: ${this.player.score}`);
		}
	},

	updateHits: function (hitCount) {
		// Atualizar contador de acertos no HUD
		const hitsText = document.querySelector("#hits-text");
		if (hitsText) {
			hitsText.setAttribute("value", `Acertos: ${hitCount}`);
		}
	},

	updateWeapon: function (newWeapon) {
		this.player.weapon = newWeapon;

		// Atualizar visual da arma
		const weapon = this.el.querySelector("#weapon");
		if (weapon) {
			if (newWeapon === "sniper") {
				weapon.setAttribute("scale", "1.2 1.2 1.5");
				weapon.setAttribute("color", "#FFD700");
			} else {
				weapon.setAttribute("scale", "1 1 1");
				weapon.setAttribute("color", "#333");
			}
		}

		console.log(`🔫 Arma atualizada para: ${newWeapon}`);
	},
});
