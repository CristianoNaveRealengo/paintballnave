# Project Structure

## Root Level Files

-   **index.html**: Main game entry point with A-Frame scene
-   **server.js**: Node.js/Express server with Socket.IO multiplayer logic
-   **package.json**: Dependencies and npm scripts
-   **paintball-config.json**: Game configuration (weapons, colors, scoring)

## Directory Organization

### `/js/` - JavaScript Code

```
js/
├── components/          # A-Frame custom components
│   ├── player-controller.js    # Player movement and state
│   ├── weapon-system.js        # Shooting mechanics
│   ├── vr-hud.js              # VR interface elements
│   ├── ar-manager.js          # AR-specific functionality
│   ├── quest-hand-tracking.js # Hand tracking for Quest
│   └── safe-physics.js        # Physics wrapper
├── config/
│   └── game-config.js         # Game settings and constants
├── effects/
│   └── effects-manager.js     # Visual effects system
├── multiplayer/
│   └── network-manager.js     # Socket.IO client logic
├── ui/
│   ├── loading-screen.js      # Loading screen management
│   └── vr-hud.js             # VR UI components
├── utils/                     # Utility functions
│   ├── math-utils.js         # Mathematical helpers
│   ├── audio-utils.js        # Audio management
│   └── ar-test.js           # AR testing utilities
└── game-init.js              # Main initialization system
```

### `/assets/` - Game Assets

```
assets/
├── audio/              # Audio files
├── sounds/             # Sound effects
├── textures/           # Image textures
└── favicon.svg         # Site icon
```

### `/css/` - Stylesheets

```
css/
└── style.css          # Game UI styles
```

### `/libs/` - Third-party Libraries

```
libs/
├── aframe-core.min.js           # A-Frame framework
├── aframe-physics-system.min.js # Physics integration
├── aframe-extras.min.js         # Additional A-Frame components
├── aframe-webxr.min.js         # WebXR support
└── aframe-hand-tracking-*.min.js # Hand tracking components
```

## Code Organization Patterns

### A-Frame Components

-   Each component handles a specific game feature
-   Components are registered globally and used via HTML attributes
-   Follow A-Frame component lifecycle (init, update, tick, remove)

### Modular Architecture

-   Features separated into logical modules
-   Event-driven communication between modules
-   Utility functions in dedicated utils folder

### Configuration Management

-   Game settings centralized in config files
-   JSON configuration for easy modification
-   Runtime configuration through game-init.js

### Asset Management

-   Assets organized by type (audio, textures, sounds)
-   Local copies of libraries for offline capability
-   SVG assets for scalable graphics

## Naming Conventions

### Files

-   **kebab-case** for file names (e.g., `player-controller.js`)
-   **Descriptive names** indicating functionality
-   **Consistent suffixes** (.js for JavaScript, .css for styles)

### Components

-   **Hyphenated names** for A-Frame components (e.g., `player-controller`)
-   **Namespace prefixes** for custom components when needed
-   **Descriptive component names** reflecting their purpose

### Variables & Functions

-   **camelCase** for JavaScript variables and functions
-   **UPPER_CASE** for constants
-   **Descriptive names** over abbreviations
