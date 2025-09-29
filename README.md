# 🎨 Paintball VR - Jogo de Paintball em Realidade Virtual

Um jogo de paintball multiplayer em realidade virtual desenvolvido com A-Frame, compatível com Meta Quest 3 e outros dispositivos VR/AR.

## 🎯 Características do Jogo

### Sistema de Paintball

-   **Tinta Colorida**: Cada jogador tem sua própria cor de tinta única
-   **Pintura Realística**: Jogadores ficam com a cor da tinta que os atingiu
-   **Projéteis Visuais**: Bolas de tinta coloridas com rastros visuais
-   **Efeitos de Impacto**: Explosões de tinta ao atingir alvos

### Mecânicas de Jogo

-   **Vida**: 100 HP por jogador
-   **Pontuação**: Ganhe pontos baseados no dano causado
-   **Duração**: Partidas de 5 minutos
-   **Vitória**: Ganha quem tiver mais pontos no final
-   **Munição**: Tinta infinita (sem necessidade de recarregar)

### Recursos VR/AR

-   **Compatibilidade**: Meta Quest 3, Oculus Rift, HTC Vive
-   **Hand Tracking**: Suporte para rastreamento de mãos
-   **Controles Intuitivos**: Aponte e atire naturalmente
-   **HUD Imersivo**: Interface 3D integrada ao ambiente

## 🚀 Como Jogar

### Instalação

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
4. Acesse `http://localhost:3000` no seu dispositivo VR

### Controles

#### Desktop

-   **Mouse**: Mirar
-   **Clique Esquerdo**: Atirar
-   **WASD**: Mover
-   **Espaço**: Pular
-   **R**: Recarregar (visual apenas)
-   **E**: Interagir

#### VR (Meta Quest 3)

-   **Trigger**: Atirar
-   **Grip**: Recarregar (visual apenas)
-   **Joystick**: Mover
-   **Hand Tracking**: Aponte para mirar, feche o punho para atirar

### Objetivos

1. **Atire nos adversários** com sua tinta colorida
2. **Evite ser atingido** para manter sua vida
3. **Acumule pontos** causando dano aos inimigos
4. **Domine a arena** com sua cor de tinta
5. **Vença** tendo mais pontos no final da partida

## 🎨 Sistema de Cores

### Cores Disponíveis

-   🌸 **Rosa/Magenta** (#FF0066)
-   🔵 **Azul** (#0066FF)
-   🟢 **Verde** (#00FF66)
-   🟠 **Laranja** (#FF6600)
-   🟣 **Roxo** (#6600FF)
-   🟡 **Amarelo** (#FFFF00)
-   🔴 **Vermelho** (#FF0000)
-   🔷 **Ciano** (#00FFFF)

### Como Funciona

-   Cada jogador recebe uma cor única ao entrar
-   Projéteis têm a cor do jogador que atirou
-   Ao ser atingido, o jogador fica com a cor da tinta
-   A cor mais recente sobrescreve as anteriores
-   Indicador visual mostra sua cor atual no HUD

## 🏗️ Estrutura do Projeto

```
paintball-vr/
├── index.html              # Página principal
├── server.js              # Servidor Node.js
├── package.json           # Dependências
├── css/
│   └── style.css         # Estilos do jogo
├── js/
│   ├── components/       # Componentes A-Frame
│   │   ├── player-controller.js
│   │   ├── weapon-system.js
│   │   └── vr-hud.js
│   ├── config/
│   │   └── game-config.js
│   ├── multiplayer/
│   │   └── network-manager.js
│   └── utils/
├── assets/
│   ├── audio/           # Sons do jogo
│   ├── textures/        # Texturas
│   └── sounds/          # Efeitos sonoros
└── libs/                # Bibliotecas A-Frame
```

## 🔧 Configuração

### Requisitos

-   Node.js 16+
-   Navegador com suporte WebXR
-   Dispositivo VR/AR (opcional)

### Configurações do Jogo

Edite `js/config/game-config.js` para personalizar:

-   Duração da partida
-   Vida dos jogadores
-   Dano das armas
-   Cores de tinta
-   Configurações de VR

### Servidor

O servidor usa Socket.IO para comunicação em tempo real:

-   Sincronização de jogadores
-   Sistema de projéteis
-   Gerenciamento de estado
-   Detecção de colisões

## 🎮 Recursos Técnicos

### A-Frame Components

-   **player-controller**: Controle do jogador e sistema de vida
-   **weapon-system**: Sistema de armas e projéteis
-   **vr-hud**: Interface de usuário em VR
-   **network-manager**: Comunicação multiplayer

### Física

-   Sistema de física CANNON.js
-   Detecção de colisões
-   Projéteis balísticos
-   Movimento realístico

### Gráficos

-   Renderização WebGL
-   Efeitos de partículas
-   Iluminação dinâmica
-   Sombras em tempo real

## 🐛 Solução de Problemas

### Problemas Comuns

**Jogo não carrega**

-   Verifique se o servidor está rodando
-   Confirme que a porta 3000 está livre
-   Teste em um navegador compatível

**VR não funciona**

-   Ative o modo desenvolvedor no headset
-   Permita conexões não seguras (HTTP)
-   Verifique compatibilidade WebXR

**Lag ou baixo FPS**

-   Reduza qualidade gráfica nas configurações
-   Feche outras aplicações
-   Use cabo USB para melhor performance

**Sem som**

-   Verifique permissões de áudio
-   Confirme que arquivos de som existem
-   Teste volume do sistema

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Áreas para Contribuição

-   Novos mapas e arenas
-   Modos de jogo adicionais
-   Melhorias de performance
-   Efeitos visuais
-   Suporte a mais dispositivos

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🎯 Roadmap

### Versão Atual (1.0)

-   ✅ Sistema básico de paintball
-   ✅ Multiplayer funcional
-   ✅ Suporte VR/AR
-   ✅ Sistema de cores

### Próximas Versões

-   🔄 Novos mapas
-   🔄 Modos de jogo (Capture the Flag, Team Deathmatch)
-   🔄 Sistema de ranking
-   🔄 Customização de personagens
-   🔄 Torneios automáticos

## 📞 Suporte

Para suporte e dúvidas:

-   Abra uma issue no GitHub
-   Consulte a documentação
-   Verifique problemas conhecidos

---

**Divirta-se pintando a arena! 🎨🎯**
