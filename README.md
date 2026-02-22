# Xhess

Xhess is a modern chess platform featuring real-time gameplay, beautiful 3D visuals, and robust backend infrastructure. Built with performance, security, and scalability in mind.

Web: https://xhess-web.onrender.com/
API: https://xhess-server.onrender.com/

Features

- 🎮 Real-time multiplayer chess with Socket.IO
- 🔒 Enterprise-grade authentication via Firebase.
- 🔗 Monorepo structure for efficient code sharing (types, utils, schemas) between frontend and backend.
- ⚡ Redis caching layer to reduce database load and latency.
- 📱 Beautiful, mobile-first interface built with Tailwind CSS.
- ✅ End-to-end type safety and form validation using Zod.
- 🏦 Redux for consistent state management
- 🧩 Follows SOLID principles in both frontend and backend
- 🐳 Fully containerized environment for consistent deployment anywhere
- 📊 Protection against DDoS and common web attacks using rate limiting, secure headers (Helmet), and strict CORS policies.

Practices such as the monorepo structure, Dockerization, extensive error handling, and the Redis caching layer are implemented as a Proof of Concept (POC). While they may be overkill for a small-scale app, they demonstrate the architecture required for a scalable, performant, and secure production-grade system.

> Feel free to peruse my code and point out suggestions as comments where ever you may see fit
