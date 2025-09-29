// Sistema de armas e projéteis
AFRAME.registerComponent("weapon-system", {
	schema: {
		weaponType: { type: "string", default: "pistol" },
		damage: { type: "number", default: 25 },
		fireRate: { type: "number", default: 500 }, // ms entre disparos
		range: { type: "number", default: 50 },
		accuracy: { type: "number", default: 0.95 },
	},

	init: function () {
		this.lastShot = 0;
		this.projectiles = new Map();
		this.setupWeaponStats();

		console.log("🔫 Sistema de armas inicializado");
	},

	setupWeaponStats: function () {
		// Cores de tinta para paintball
		this.paintColors = [
			"#FF0066", // Rosa/Magenta
			"#0066FF", // Azul
			"#00FF66", // Verde
			"#FF6600", // Laranja
			"#6600FF", // Roxo
			"#FFFF00", // Amarelo
			"#FF0000", // Vermelho
			"#00FFFF", // Ciano
		];

		this.weapons = {
			pistol: {
				damage: 25,
				fireRate: 500,
				range: 30,
				accuracy: 0.9,
				speed: 50,
				paintColor: this.getPlayerPaintColor(), // Cor baseada no jogador
			},
			sniper: {
				damage: 50,
				fireRate: 1500,
				range: 80,
				accuracy: 0.98,
				speed: 100,
				paintColor: this.getPlayerPaintColor(), // Cor baseada no jogador
			},
		};
	},

	getPlayerPaintColor: function () {
		// Obter cor do jogador atual
		const playerController = this.el.components["player-controller"];
		if (
			playerController &&
			playerController.player &&
			playerController.player.paintColor
		) {
			return playerController.player.paintColor;
		}

		// Tentar obter do network manager
		if (window.networkManager && window.networkManager.playerId) {
			const playerIndex =
				parseInt(window.networkManager.playerId.slice(-1)) || 0;
			return this.paintColors[playerIndex % this.paintColors.length];
		}

		// Cor padrão se não conseguir obter do jogador
		return this.paintColors[0]; // Primeira cor como padrão
	},

	canShoot: function () {
		const now = Date.now();
		const weapon = this.weapons[this.data.weaponType];
		return now - this.lastShot >= weapon.fireRate;
	},

	createProjectile: function (shootData) {
		if (!this.canShoot()) return null;

		this.lastShot = Date.now();

		// Atualizar cor da arma antes de criar projétil
		this.weapons.pistol.paintColor = this.getPlayerPaintColor();
		this.weapons.sniper.paintColor = this.getPlayerPaintColor();

		const weapon = this.weapons[shootData.weapon || "pistol"];

		// Aplicar dispersão baseada na precisão
		const spread = (1 - weapon.accuracy) * 0.1;
		const direction = {
			x: shootData.direction.x + (Math.random() - 0.5) * spread,
			y: shootData.direction.y + (Math.random() - 0.5) * spread,
			z: shootData.direction.z + (Math.random() - 0.5) * spread,
		};

		// Normalizar direção
		const length = Math.sqrt(
			direction.x * direction.x +
				direction.y * direction.y +
				direction.z * direction.z
		);
		direction.x /= length;
		direction.y /= length;
		direction.z /= length;

		// Criar entidade do projétil (bola de tinta)
		const projectile = document.createElement("a-sphere");
		projectile.setAttribute("radius", "0.08"); // Maior para parecer bola de tinta
		projectile.setAttribute("color", weapon.paintColor);
		projectile.setAttribute("material", {
			color: weapon.paintColor,
			emissive: weapon.paintColor,
			emissiveIntensity: 0.2,
			metalness: 0.1,
			roughness: 0.8,
			transparent: false,
			opacity: 1.0,
		});
		projectile.setAttribute("position", shootData.position);
		projectile.setAttribute("class", "projectile paintball");

		// Adicionar componente de projétil
		projectile.setAttribute("projectile", {
			direction: `${direction.x} ${direction.y} ${direction.z}`,
			speed: weapon.speed,
			damage: weapon.damage,
			range: weapon.range,
			playerId: shootData.playerId || "unknown",
			weapon: shootData.weapon || "pistol",
			paintColor: weapon.paintColor,
		});

		// Física removida para melhor performance e compatibilidade
		// Os projéteis usam movimento manual via tick() que é mais eficiente

		// Adicionar à cena
		const projectilesContainer = document.querySelector("#projectiles");
		if (projectilesContainer) {
			projectilesContainer.appendChild(projectile);
		} else {
			document.querySelector("a-scene").appendChild(projectile);
		}

		// Armazenar referência
		this.projectiles.set(shootData.id, projectile);

		console.log("💥 Projétil criado:", {
			id: shootData.id,
			position: shootData.position,
			color: weapon.paintColor,
			element: projectile,
		});

		// Debug: Adicionar evento para verificar se o projétil foi adicionado
		setTimeout(() => {
			if (projectile.parentNode) {
				console.log("✅ Projétil adicionado à cena com sucesso");
			} else {
				console.error("❌ Projétil não foi adicionado à cena");
			}
		}, 100);

		return projectile;
	},

	removeProjectile: function (projectileId) {
		const projectile = this.projectiles.get(projectileId);
		if (projectile && projectile.parentNode) {
			projectile.parentNode.removeChild(projectile);
			this.projectiles.delete(projectileId);
		}
	},
});

// Componente individual do projétil
AFRAME.registerComponent("projectile", {
	schema: {
		direction: { type: "vec3", default: { x: 0, y: 0, z: -1 } },
		speed: { type: "number", default: 50 },
		damage: { type: "number", default: 25 },
		range: { type: "number", default: 50 },
		playerId: { type: "string", default: "" },
		weapon: { type: "string", default: "pistol" },
		paintColor: { type: "string", default: "#FF0066" },
	},

	init: function () {
		this.startPosition = this.el.getAttribute("position");
		this.distanceTraveled = 0;
		this.velocity = {
			x: this.data.direction.x * this.data.speed,
			y: this.data.direction.y * this.data.speed,
			z: this.data.direction.z * this.data.speed,
		};

		// Configurar eventos de colisão
		this.el.addEventListener("collide", this.onCollide.bind(this));

		// Auto-destruição após tempo limite
		setTimeout(() => {
			this.destroy();
		}, 5000);

		// Adicionar trail visual
		this.createTrail();
	},

	createTrail: function () {
		// Criar rastro visual do projétil com cor da tinta
		const trail = document.createElement("a-cylinder");
		trail.setAttribute("radius", "0.015");
		trail.setAttribute("height", "0.8");
		trail.setAttribute("color", this.data.paintColor);
		trail.setAttribute("material", {
			color: this.data.paintColor,
			emissive: this.data.paintColor,
			emissiveIntensity: 0.3,
			transparent: true,
			opacity: 0.7,
		});
		trail.setAttribute("position", "0 0 -0.4");
		trail.setAttribute("rotation", "90 0 0");

		this.el.appendChild(trail);
	},

	onCollide: function (event) {
		const target = event.detail.target;

		// Ignorar colisão com o próprio atirador
		if (target.id === "player" || target.closest("#player")) {
			const playerController = target.closest("[player-controller]");
			if (
				playerController &&
				playerController.components["player-controller"].player.id ===
					this.data.playerId
			) {
				return;
			}
		}

		// Verificar se atingiu um jogador
		if (
			target.hasAttribute("player-controller") ||
			target.closest("[player-controller]") ||
			target.classList.contains("player-body")
		) {
			this.hitPlayer(target);
		} else {
			// Atingiu obstáculo ou parede
			this.hitObstacle(target);
		}
	},

	hitPlayer: function (target) {
		const playerElement = target.hasAttribute("player-controller")
			? target
			: target.closest("[player-controller]");

		if (playerElement) {
			const playerController =
				playerElement.components["player-controller"];

			// Verificar se não é o próprio atirador
			if (playerController.player.id !== this.data.playerId) {
				// Aplicar dano com cor da tinta
				playerController.takeDamage(
					this.data.damage,
					this.data.playerId,
					this.data.paintColor
				);

				// Criar efeito de impacto com cor da tinta
				this.createHitEffect(
					this.el.getAttribute("position"),
					this.data.paintColor
				);

				// Notificar hit no servidor
				if (window.networkManager) {
					window.networkManager.reportHit({
						shooterId: this.data.playerId,
						targetId: playerController.player.id,
						damage: this.data.damage,
						weapon: this.data.weapon,
						position: this.el.getAttribute("position"),
					});
				}

				console.log(
					`🎯 Projétil atingiu jogador! Dano: ${this.data.damage}`
				);
			}
		}

		this.destroy();
	},

	hitObstacle: function (target) {
		// Criar efeito de impacto em obstáculo
		this.createHitEffect(this.el.getAttribute("position"), "#888888");

		console.log("💥 Projétil atingiu obstáculo");
		this.destroy();
	},

	createHitEffect: function (position, color) {
		// Criar efeito visual de impacto
		const effect = document.createElement("a-sphere");
		effect.setAttribute("radius", "0.2");
		effect.setAttribute("color", color);
		effect.setAttribute("position", position);
		effect.setAttribute("opacity", "0.8");

		// Animação de expansão e desaparecimento
		effect.setAttribute("animation", {
			property: "scale",
			from: "0.1 0.1 0.1",
			to: "2 2 2",
			dur: 300,
			easing: "easeOutQuad",
		});

		effect.setAttribute("animation__fade", {
			property: "opacity",
			from: "0.8",
			to: "0",
			dur: 300,
			easing: "easeOutQuad",
		});

		// Adicionar à cena
		const effectsContainer = document.querySelector("#effects");
		if (effectsContainer) {
			effectsContainer.appendChild(effect);
		} else {
			document.querySelector("a-scene").appendChild(effect);
		}

		// Remover após animação
		setTimeout(() => {
			if (effect.parentNode) {
				effect.parentNode.removeChild(effect);
			}
		}, 400);

		// Criar partículas
		this.createParticles(position, color);
	},

	createParticles: function (position, color) {
		// Criar sistema de partículas simples
		for (let i = 0; i < 5; i++) {
			const particle = document.createElement("a-sphere");
			particle.setAttribute("radius", "0.02");
			particle.setAttribute("color", color);

			// Posição aleatória ao redor do impacto
			const offset = {
				x: (Math.random() - 0.5) * 0.5,
				y: (Math.random() - 0.5) * 0.5,
				z: (Math.random() - 0.5) * 0.5,
			};

			particle.setAttribute("position", {
				x: position.x + offset.x,
				y: position.y + offset.y,
				z: position.z + offset.z,
			});

			// Animação de movimento e desaparecimento
			particle.setAttribute("animation", {
				property: "position",
				from: `${position.x + offset.x} ${position.y + offset.y} ${
					position.z + offset.z
				}`,
				to: `${position.x + offset.x * 3} ${
					position.y + offset.y * 3
				} ${position.z + offset.z * 3}`,
				dur: 500,
				easing: "easeOutQuad",
			});

			particle.setAttribute("animation__fade", {
				property: "opacity",
				from: "1",
				to: "0",
				dur: 500,
				easing: "easeOutQuad",
			});

			// Adicionar à cena
			const effectsContainer = document.querySelector("#effects");
			if (effectsContainer) {
				effectsContainer.appendChild(particle);
			} else {
				document.querySelector("a-scene").appendChild(particle);
			}

			// Remover após animação
			setTimeout(() => {
				if (particle.parentNode) {
					particle.parentNode.removeChild(particle);
				}
			}, 600);
		}
	},

	tick: function (time, timeDelta) {
		// Mover projétil
		const currentPosition = this.el.getAttribute("position");
		const deltaTime = timeDelta / 1000; // Converter para segundos

		const newPosition = {
			x: currentPosition.x + this.velocity.x * deltaTime,
			y: currentPosition.y + this.velocity.y * deltaTime,
			z: currentPosition.z + this.velocity.z * deltaTime,
		};

		this.el.setAttribute("position", newPosition);

		// Calcular distância percorrida
		const dx = newPosition.x - this.startPosition.x;
		const dy = newPosition.y - this.startPosition.y;
		const dz = newPosition.z - this.startPosition.z;
		this.distanceTraveled = Math.sqrt(dx * dx + dy * dy + dz * dz);

		// Verificar se excedeu o alcance
		if (this.distanceTraveled > this.data.range) {
			this.destroy();
		}

		// Aplicar gravidade
		this.velocity.y -= 9.8 * deltaTime;
	},

	destroy: function () {
		if (this.el && this.el.parentNode) {
			this.el.parentNode.removeChild(this.el);
		}
	},
});

// Componente para health packs
AFRAME.registerComponent("health-pack", {
	schema: {
		amount: { type: "number", default: 25 },
		respawnTime: { type: "number", default: 15000 },
	},

	init: function () {
		this.active = true;
		this.setupInteraction();
	},

	setupInteraction: function () {
		this.el.addEventListener("collide", (event) => {
			const target = event.detail.target;

			if (this.active && target.hasAttribute("player-controller")) {
				this.collect(target);
			}
		});
	},

	collect: function (player) {
		const playerController = player.components["player-controller"];

		if (playerController.player.health < 100) {
			const healAmount = Math.min(
				this.data.amount,
				100 - playerController.player.health
			);
			playerController.updateHealth(
				playerController.player.health + healAmount
			);

			// Desativar health pack
			this.active = false;
			this.el.setAttribute("visible", false);

			// Efeito visual de coleta
			this.createCollectEffect();

			// Som de coleta
			const powerupSound = document.querySelector("#powerupSound");
			if (powerupSound) {
				powerupSound.currentTime = 0;
				powerupSound
					.play()
					.catch((e) => console.log("Erro ao tocar som:", e));
			}

			// Respawn após tempo determinado
			setTimeout(() => {
				this.respawn();
			}, this.data.respawnTime);

			console.log(`❤️ Health pack coletado! +${healAmount} HP`);
		}
	},

	createCollectEffect: function () {
		const position = this.el.getAttribute("position");

		// Criar efeito de coleta
		const effect = document.createElement("a-ring");
		effect.setAttribute("radius-inner", "0.5");
		effect.setAttribute("radius-outer", "1");
		effect.setAttribute("color", "#00ff00");
		effect.setAttribute("position", position);
		effect.setAttribute("rotation", "-90 0 0");

		effect.setAttribute("animation", {
			property: "scale",
			from: "0.1 0.1 0.1",
			to: "3 3 3",
			dur: 500,
			easing: "easeOutQuad",
		});

		effect.setAttribute("animation__fade", {
			property: "opacity",
			from: "1",
			to: "0",
			dur: 500,
			easing: "easeOutQuad",
		});

		document.querySelector("a-scene").appendChild(effect);

		setTimeout(() => {
			if (effect.parentNode) {
				effect.parentNode.removeChild(effect);
			}
		}, 600);
	},

	respawn: function () {
		this.active = true;
		this.el.setAttribute("visible", true);

		// Efeito de respawn
		this.el.setAttribute("animation__respawn", {
			property: "scale",
			from: "0 0 0",
			to: "1 1 1",
			dur: 500,
			easing: "easeOutBounce",
		});

		console.log("❤️ Health pack respawnou");
	},
});

// Componente para arma especial
AFRAME.registerComponent("special-weapon", {
	schema: {
		type: { type: "string", default: "sniper" },
		respawnTime: { type: "number", default: 30000 },
	},

	init: function () {
		this.active = true;
		this.setupInteraction();
	},

	setupInteraction: function () {
		this.el.addEventListener("collide", (event) => {
			const target = event.detail.target;

			if (this.active && target.hasAttribute("player-controller")) {
				this.collect(target);
			}
		});
	},

	collect: function (player) {
		const playerController = player.components["player-controller"];

		// Atualizar arma do jogador
		playerController.updateWeapon(this.data.type);

		// Desativar arma especial
		this.active = false;
		this.el.setAttribute("visible", false);

		// Efeito visual de coleta
		this.createCollectEffect();

		// Som de coleta
		const powerupSound = document.querySelector("#powerupSound");
		if (powerupSound) {
			powerupSound.currentTime = 0;
			powerupSound
				.play()
				.catch((e) => console.log("Erro ao tocar som:", e));
		}

		// Respawn após tempo determinado
		setTimeout(() => {
			this.respawn();
		}, this.data.respawnTime);

		console.log(`🔫 Arma especial coletada: ${this.data.type}`);
	},

	createCollectEffect: function () {
		const position = this.el.getAttribute("position");

		// Criar efeito de coleta dourado
		const effect = document.createElement("a-ring");
		effect.setAttribute("radius-inner", "0.8");
		effect.setAttribute("radius-outer", "1.5");
		effect.setAttribute("color", "#FFD700");
		effect.setAttribute("position", position);
		effect.setAttribute("rotation", "-90 0 0");

		effect.setAttribute("animation", {
			property: "scale",
			from: "0.1 0.1 0.1",
			to: "4 4 4",
			dur: 800,
			easing: "easeOutQuad",
		});

		effect.setAttribute("animation__fade", {
			property: "opacity",
			from: "1",
			to: "0",
			dur: 800,
			easing: "easeOutQuad",
		});

		document.querySelector("a-scene").appendChild(effect);

		setTimeout(() => {
			if (effect.parentNode) {
				effect.parentNode.removeChild(effect);
			}
		}, 900);
	},

	respawn: function () {
		this.active = true;
		this.el.setAttribute("visible", true);

		// Efeito de respawn
		this.el.setAttribute("animation__respawn", {
			property: "scale",
			from: "0 0 0",
			to: "1 1 1",
			dur: 800,
			easing: "easeOutBounce",
		});

		console.log("🔫 Arma especial respawnou");
	},
});
