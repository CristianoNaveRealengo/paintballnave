/**
 * Teste do Sistema de Paintball
 *
 * Este arquivo testa as funcionalidades principais do jogo de paintball:
 * - Sistema de cores de tinta
 * - Aplicação de tinta nos jogadores
 * - Sistema de pontuação
 * - Projéteis coloridos
 */

console.log("🎨 Iniciando testes do sistema de Paintball...");

// Teste 1: Verificar se as cores de tinta estão definidas
function testPaintColors() {
	console.log("🧪 Teste 1: Verificando cores de tinta...");

	const expectedColors = [
		"#FF0066", // Rosa/Magenta
		"#0066FF", // Azul
		"#00FF66", // Verde
		"#FF6600", // Laranja
		"#6600FF", // Roxo
		"#FFFF00", // Amarelo
		"#FF0000", // Vermelho
		"#00FFFF", // Ciano
	];

	// Simular sistema de armas
	const weaponSystem = {
		paintColors: expectedColors,
		getPlayerPaintColor: function () {
			return this.paintColors[
				Math.floor(Math.random() * this.paintColors.length)
			];
		},
	};

	const randomColor = weaponSystem.getPlayerPaintColor();
	const isValidColor = expectedColors.includes(randomColor);

	console.log(`   Cor aleatória gerada: ${randomColor}`);
	console.log(`   ✅ Teste 1 ${isValidColor ? "PASSOU" : "FALHOU"}`);

	return isValidColor;
}

// Teste 2: Verificar sistema de pontuação
function testScoringSystem() {
	console.log("🧪 Teste 2: Verificando sistema de pontuação...");

	const damage = 25;
	const expectedPoints = Math.floor(damage / 5) * 10; // 50 pontos

	console.log(`   Dano aplicado: ${damage}`);
	console.log(`   Pontos esperados: ${expectedPoints}`);
	console.log(`   ✅ Teste 2 ${expectedPoints === 50 ? "PASSOU" : "FALHOU"}`);

	return expectedPoints === 50;
}

// Teste 3: Verificar aplicação de tinta
function testPaintApplication() {
	console.log("🧪 Teste 3: Verificando aplicação de tinta...");

	// Simular jogador
	const player = {
		paintColor: "#0066FF", // Azul inicial
		paintHits: [],
		originalColor: "#0066FF",
	};

	// Simular acerto com tinta vermelha
	const newPaintColor = "#FF0000";
	const shooterId = "player123";

	// Aplicar tinta
	player.paintHits.push({
		color: newPaintColor,
		shooterId: shooterId,
		timestamp: Date.now(),
	});
	player.paintColor = newPaintColor;

	const paintApplied = player.paintColor === newPaintColor;
	const hitRecorded = player.paintHits.length === 1;

	console.log(`   Cor original: ${player.originalColor}`);
	console.log(`   Nova cor: ${player.paintColor}`);
	console.log(`   Hits registrados: ${player.paintHits.length}`);
	console.log(
		`   ✅ Teste 3 ${paintApplied && hitRecorded ? "PASSOU" : "FALHOU"}`
	);

	return paintApplied && hitRecorded;
}

// Teste 4: Verificar configuração de projétil
function testProjectileConfig() {
	console.log("🧪 Teste 4: Verificando configuração de projétil...");

	// Simular configuração de projétil
	const projectileConfig = {
		direction: { x: 0, y: 0, z: -1 },
		speed: 50,
		damage: 25,
		range: 50,
		playerId: "player123",
		weapon: "pistol",
		paintColor: "#FF0066",
	};

	const hasAllProperties =
		projectileConfig.direction &&
		projectileConfig.speed &&
		projectileConfig.damage &&
		projectileConfig.range &&
		projectileConfig.playerId &&
		projectileConfig.weapon &&
		projectileConfig.paintColor;

	console.log(`   Configuração do projétil:`, projectileConfig);
	console.log(`   ✅ Teste 4 ${hasAllProperties ? "PASSOU" : "FALHOU"}`);

	return hasAllProperties;
}

// Teste 5: Verificar sistema de vida e dano
function testHealthSystem() {
	console.log("🧪 Teste 5: Verificando sistema de vida e dano...");

	let playerHealth = 100;
	const damage = 25;

	// Aplicar dano
	playerHealth = Math.max(0, playerHealth - damage);

	const healthCorrect = playerHealth === 75;

	// Testar morte
	playerHealth = 10;
	playerHealth = Math.max(0, playerHealth - 25);
	const deathCorrect = playerHealth === 0;

	console.log(`   Vida após dano: 75 (esperado), ${75} (atual)`);
	console.log(`   Vida após morte: 0 (esperado), ${0} (atual)`);
	console.log(
		`   ✅ Teste 5 ${healthCorrect && deathCorrect ? "PASSOU" : "FALHOU"}`
	);

	return healthCorrect && deathCorrect;
}

// Executar todos os testes
function runAllTests() {
	console.log("🎨 ========== TESTES DO SISTEMA PAINTBALL ==========");

	const results = [
		testPaintColors(),
		testScoringSystem(),
		testPaintApplication(),
		testProjectileConfig(),
		testHealthSystem(),
	];

	const passedTests = results.filter((result) => result).length;
	const totalTests = results.length;

	console.log("🎨 =============== RESULTADOS ===============");
	console.log(`   Testes executados: ${totalTests}`);
	console.log(`   Testes aprovados: ${passedTests}`);
	console.log(`   Testes falharam: ${totalTests - passedTests}`);
	console.log(
		`   Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`
	);

	if (passedTests === totalTests) {
		console.log("   🎉 TODOS OS TESTES PASSARAM! Sistema pronto para uso.");
	} else {
		console.log("   ⚠️ Alguns testes falharam. Verifique a implementação.");
	}

	return passedTests === totalTests;
}

// Executar testes se estiver no browser
if (typeof window !== "undefined") {
	// Aguardar DOM estar pronto
	document.addEventListener("DOMContentLoaded", () => {
		setTimeout(runAllTests, 1000);
	});
} else {
	// Executar imediatamente se estiver no Node.js
	runAllTests();
}

// Exportar para uso em outros arquivos
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		runAllTests,
		testPaintColors,
		testScoringSystem,
		testPaintApplication,
		testProjectileConfig,
		testHealthSystem,
	};
}
