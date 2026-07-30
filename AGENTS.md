# AGENTS

This file is for AI agents (Hermes, Claude Code, Codex) working in this project.

## Project Overview

**MUOnline** — A web-based MMORPG inspired by the classic MU Online game, built with React + Three.js for the client and Node.js + Express + Socket.io for the server. Supports real-time multiplayer combat, guild systems, party, PvP, trading, character progression, and boss raids. Deployed as a browser-based game with MongoDB backend.

**GitHub:** https://github.com/onechapter/MUOnline

## Build Commands

```bash
# Install all dependencies (root + server + client)
npm run install:all

# Start dev servers (server:3001 + client:5173)
npm run dev

# Run tests (server + client)
npm run test

# Build client for production
npm run build
```

## Architecture

**Monorepo structure:**
- `client/` — React + Vite + Three.js (@react-three/fiber) web game client (port 5173)
- `server/` — Node.js + Express + Socket.io + MongoDB (Mongoose) game server (port 3001)
- `shared/` — Shared constants and types
- `docs/` — Game specs, implementation checklists, testing guidelines

**Real-time communication:** Socket.io for game state sync (movement, combat, chat, trading)
**Auth:** JWT-based authentication with bcrypt password hashing
**Database:** MongoDB (mongoose models: User, Character)
**Game systems:** World, Combat, PvP, Guild, Party, Boss, Drop, Enhancement, Trading, NPC, MonsterAI, Spawn, Movement

## Security Baseline

- Validate all input server-side
- Never trust client-provided identity, scope, or permissions
- Store secrets in .env — never commit credentials
- No secrets in logs or error messages
- Follow OWASP Top 10
- JWT_SECRET must be changed in production

## Testing

```bash
cd server && npm test
cd client && npm test
```

Test coverage target: 80% for core game logic (CombatSystem, PvPSystem, World).
Socket handlers need integration tests (currently low coverage).

## Oh My Hermes Setup

This project uses Oh My Hermes for automated workflows:
- Health check (every 15 min)
- Log observer (hourly)
- Product review (hourly)
- Security daily scan (08:30 daily)
- Security weekly audit (09:00 Monday)

Profiles: cto, pm, designer, dev, qa, ops, security