# Technology Stack

## Core Technologies

-   **A-Frame**: WebXR framework for VR/AR development
-   **Node.js**: Backend server (v16+)
-   **Socket.IO**: Real-time multiplayer communication
-   **Express.js**: Web server framework
-   **WebXR**: Native VR/AR browser APIs

## Libraries & Dependencies

### Frontend

-   **A-Frame Core**: Main VR/AR framework
-   **A-Frame Physics System**: CANNON.js physics integration
-   **A-Frame Extras**: Additional A-Frame components
-   **A-Frame Hand Tracking**: Quest hand tracking support
-   **Socket.IO Client**: Real-time communication

### Backend

-   **Express**: Web server
-   **Socket.IO**: WebSocket server
-   **Compression**: Response compression
-   **CORS**: Cross-origin resource sharing
-   **Helmet**: Security headers

### Development

-   **Nodemon**: Development server auto-reload
-   **Puppeteer**: Testing automation

## Build System

### Development Commands

```bash
npm install          # Install dependencies
npm start           # Start production server (port 3000)
npm run dev         # Start development server with auto-reload
npm run build       # Build project (currently echo placeholder)
npm test            # Run tests (currently placeholder)
```

### Server Configuration

-   **Port**: 3000 (configurable via PORT env var)
-   **Static Files**: Served from project root
-   **WebSocket**: Socket.IO with CORS enabled for all origins

## Architecture Patterns

### Component-Based Architecture

-   A-Frame components for game functionality
-   Modular JavaScript files organized by feature
-   Event-driven communication between components

### Real-time Multiplayer

-   Server authoritative game state
-   Client prediction for smooth gameplay
-   Socket.IO events for player actions and state sync

### Device Adaptation

-   Automatic device detection (Desktop/VR/AR)
-   Progressive enhancement based on capabilities
-   Fallback controls for different input methods

## File Organization

-   `/js/components/`: A-Frame components
-   `/js/config/`: Game configuration
-   `/js/multiplayer/`: Network management
-   `/js/utils/`: Utility functions
-   `/assets/`: Game assets (audio, textures)
-   `/libs/`: Third-party libraries (local copies)
