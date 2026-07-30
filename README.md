# MU Online - Web MMORPG

A web-based MMORPG inspired by MU Online, built with React, Three.js, Node.js, and Socket.io.

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both servers (client + server)
npm run dev

# Or start separately:
cd server && npm run dev   # Server on port 3001
cd client && npm run dev   # Client on port 5173
```

## Project Structure

```
├── client/           # React + Three.js frontend
├── server/           # Node.js + Express backend
├── shared/           # Shared constants and types
├── docs/             # Project documentation
├── package.json      # Root package.json
└── README.md         # This file
```

## Tech Stack

- **Frontend**: React, Three.js (@react-three/fiber), Redux Toolkit, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, MongoDB (Mongoose), JWT, bcrypt
- **Testing**: Jest + Supertest (server), Vitest + React Testing Library (client)

## Running Tests

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Characters
- `GET /api/characters/classes` - Get available character classes
- `POST /api/characters` - Create character (requires auth)
- `GET /api/characters` - List user's characters (requires auth)
- `GET /api/characters/:id` - Get character details (requires auth)
- `DELETE /api/characters/:id` - Delete character (requires auth)
- `PATCH /api/characters/:id/stats` - Update character stats (requires auth)

## Status

**Phase 1: Core Foundation** ✅
- [x] Project setup
- [x] Authentication system
- [x] Character system
- [x] 3D rendering (basic)
- [x] Unit tests (81% coverage)