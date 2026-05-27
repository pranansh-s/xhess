<div align="center">
  <img src="./assets/banner.png" alt="Xhess Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

# XHESS

### A Modern, Real-Time 3D Chess Platform & High-Scalability Monorepo

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9.1.2-blueviolet?style=for-the-badge&logo=three.js)](https://github.com/pmndrs/react-three-fiber)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-5.5-red?style=for-the-badge&logo=redis)](https://redis.io/)
[![Firebase](https://img.shields.io/badge/Firebase-11.7-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-system-architecture">System Architecture</a> •
    <a href="#-custom-rules-engine">Rules Engine</a> •
    <a href="#-monorepo-structure">Monorepo Structure</a> •
    <a href="#-installation--setup">Setup Guide</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## 🌟 Introduction

**Xhess** is a professional, production-grade real-time chess platform featuring immersive 3D visuals, robust monorepo code sharing, and a highly scalable backend architecture.

Rather than a simple Minimum Viable Product, Xhess is designed as a **Proof of Concept (POC)** demonstrating the architectural patterns, security controls, and caching layers required to support large-scale, high-concurrency gaming applications.

---

## ⚡ Key Features

- **🎮 Immersive 3D Chessboard:** Sleek, custom 3D chess pieces (King & Queen models) rendered smoothly in the browser using **React Three Fiber (R3F)**, **Drei**, and **Three.js**.
- **🔌 Real-Time Gameplay:** Bidirectional, ultra-low-latency move and game state updates powered by **Socket.IO** rooms.
- **⚡ Cache-Aside Storage Pipeline:** A highly performant database access pattern using a **Redis** cache in front of a reliable **Google Firestore (Firebase)** document store.
- **🔗 Unified Monorepo:** Shared TypeScript types, Zod schemas, and utility functions package (`@xhess/shared`) for complete, compile-time end-to-end type safety between frontend and backend.
- **🔒 Secure & Resilient Architecture:** Enterprise-grade security containing **Firebase Auth** validations, **Helmet** HTTP headers, **strict CORS** settings, and Express **rate limiting** to mitigate DDoS and common web threats.
- **🏦 Consistent State Management:** Predictable state containers built with **Redux Toolkit** and Redux-Thunk to ensure smooth in-game user interfaces.
- **🐳 Fully Containerized:** Built with Docker and multi-stage builds (`Dockerfile.server`, `Dockerfile.web`, `docker-compose.yml`) for seamless local runs and effortless deployments.

---

## 🏗️ System Architecture

Xhess leverages modern system design patterns, separating core game logic, caching concerns, and persistent storage:

```mermaid
graph TD
    A[Next.js 3D Web App] <-->|Socket.IO Bidirectional| B(Express Backend API)
    A -->|HTTPS REST API| B
    B -->|1. Cache Query| C{Redis Cache}
    C -->|Cache Hit| B
    C -->|Cache Miss| D[Firebase Firestore]
    D -->|2. Return Document| B
    B -->|3. Populate Cache| C
```

### 🏎️ The Cache-Aside Pattern

To minimize latency and Firebase Firestore read/write billing under continuous multiplayer actions, the server utilizes a strategic cache-aside manager (`db.controller.ts`):

1.  **Read Action:** The service queries Redis. If the data is cached (Cache Hit), it's returned immediately. If not found (Cache Miss), the database fetches it from Google Firestore, updates the Redis cache (with a 60-minute TTL), and returns the payload.
2.  **Write/Delete Action:** Mutations are committed directly to Firestore first, and then corresponding Redis cache keys are instantly updated or evicted to avoid stale reads.

---

## 🧩 Custom Rules Engine

Xhess implements its own custom chess engine from the ground up under `@xhess/shared/utils/chess.ts`, ensuring complete control over gameplay validation without external npm packages:

- **Move Calculators:** Generates legal move sets for Pawns (including initial double steps), Rooks, Knights, Bishops, Queens, and Kings.
- **Pin & Check Detection:** Calculates coordinate matrices to predict if a hypothetical move would place or leave the current player's King in check (`willMoveCheck`), filtering out illegal moves before rendering them.
- **Endgame Valuator:** Automatically evaluates and handles **Stalemate** and **Checkmate** scenarios to gracefully finish rooms and reward winners.

---

## 📂 Monorepo Structure

The workspace is organized as an **npm Workspaces monorepo**, simplifying code sharing across three distinct components:

```
xhess/
├── assets/                  # High-quality visual assets and banners
├── shared/                  # Common library package (@xhess/shared)
│   ├── src/
│   │   ├── constants/       # Chessboard direction vectors (cardinal, diagonal, knight)
│   │   ├── schemas/         # Shared Zod validation schemas (Auth, Room, Profiles)
│   │   ├── types/           # Shared Type definitions (Piece, Game, Move, Position)
│   │   └── utils/           # Shared Chess logic, board state mutators, and engines
│   └── package.json
├── server/                  # Backend Express Node application (@xhess/server)
│   ├── src/
│   │   ├── config/          # Environment configuration loaders (Firebase, Sockets)
│   │   ├── controllers/     # Socket controllers and Cache-Aside database layers
│   │   ├── databases/       # Redis client & Firebase Admin SDK initializers
│   │   ├── middleware/      # Rate-limit, Helmet, CORS, and Auth middleware
│   │   └── routes/          # Express Profile and Room Router maps
│   └── package.json
├── web/                     # Frontend Next.js Client App (@xhess/web)
│   ├── src/
│   │   ├── app/             # Next.js App Router folders (pages, dynamic room routing)
│   │   ├── components/      # Common 3D models, landing setups, custom 3D Board and Cells
│   │   └── redux/           # Global store, slices, and custom hooks
│   └── package.json
├── docker-compose.yml       # Full monorepo containerization configuration
└── package.json             # Root npm workspace conductor
```

---

## ⚙️ Installation & Setup

Ensure you have **Node.js (v18+)**, **Redis**, and a **Firebase Service Account** ready.

### 1. Environment Variables Configuration

Create a `.env` file in both `server/` and `web/` directories:

#### Backend Environment (`server/.env`)

```env
PORT=8000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

#### Frontend Environment (`web/.env`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
```

### 2. Redis Setup for Local Run

The backend server relies on Redis for high-performance caching. You must have a Redis instance running locally at `localhost:6379` before starting the native development servers. 

Choose one of the following methods to spin up Redis:

#### Option A: Run via Docker (Recommended & Simplest)
If you have Docker installed, you can start a lightweight Redis container with a single command:
```bash
docker run --name xhess-redis -p 6379:6379 -d redis:7-alpine
```
*Tip: Use `docker stop xhess-redis` and `docker start xhess-redis` to stop and start the container as needed.*

#### Option B: Run Natively on Your Host OS
*   **macOS (Homebrew):**
    ```bash
    brew install redis
    brew services start redis
    ```
*   **Linux (Ubuntu/Debian):**
    ```bash
    sudo apt update
    sudo apt install redis-server
    sudo systemctl start redis-server
    ```
*   **Windows:**
    Run Redis via WSL2 by following the [Official Redis Setup Guide](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-windows/).

---

### 3. Local Development Run

Install all workspace dependencies at the root:

```bash
npm install
```

Start the respective microservices (ensure Redis is already running from the step above):

```bash
# Run backend development server (hot-reloads with tsx)
npm run server-dev

# Run Next.js frontend client (hot-reloads with turbopack)
npm run web-dev
```

### 4. Docker Compose Orchestration

Alternatively, run the entire stack inside containerized nodes (which automatically links Next.js, Express, and Redis containers without needing a separate local Redis instance):

```bash
docker-compose up --build
```

---

## 🚀 Deployment

The project is pre-configured for continuous integration and zero-downtime deployment:

- **Server Deployments:** Managed using `Dockerfile.server` targeting Express.
- **Web Deployments:** Containerized via `Dockerfile.web` utilizing optimized Next.js multi-stage build layers.
- **Render Support:** Configured via `render.yaml` for rapid, single-click monorepo deployments.
