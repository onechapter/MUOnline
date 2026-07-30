# 🎮 MMORPG GAME PROJECT - MU Online Style

> Dự án xây dựng game nhập vai trực tuyến nhiều người chơi (MMORPG) lấy cảm hứng từ MU Online, chạy trên web browser với đồ họa 3D.

---

## 📚 TÀI LIỆU DỰ ÁN

### 🚀 [START-HERE.md](./START-HERE.md) - **ĐỌC ĐẦU TIÊN**
Hướng dẫn bắt đầu cho Agent, workflow, quy tắc quan trọng

### 📋 [game-implementation-checklist.md](./game-implementation-checklist.md) - **FILE LÀM VIỆC CHÍNH**
- 107 tasks chi tiết chia thành 8 Phases
- Checkbox để đánh dấu hoàn thành
- Testing requirements cho mỗi Phase
- Progress tracking

### 📖 [game-muonline-spec.md](./game-muonline-spec.md) - **ĐẶC TẢ TỔNG QUAN**
- Mô tả các hệ thống game
- Công nghệ và kiến trúc
- Database schemas
- UI/UX mockups
- Game formulas

### 🧪 [testing-guidelines.md](./testing-guidelines.md) - **HƯỚNG DẪN TESTING**
- Setup testing frameworks
- Unit test examples
- Integration test examples
- Coverage requirements
- Best practices

### ⚡ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - **THAM KHẢO NHANH**
- NPM commands
- Game formulas
- Database schemas cheat sheet
- Socket.io events
- Test assertions
- Security checklist

---

## 🎯 OVERVIEW

### Công nghệ sử dụng

**Frontend:**
- React.js - UI framework
- Three.js / Babylon.js - 3D graphics
- Socket.io-client - Real-time communication
- Redux Toolkit - State management

**Backend:**
- Node.js + Express - Server framework
- Socket.io - WebSocket server
- MongoDB + Mongoose - Database
- JWT + bcrypt - Authentication

**Testing:**
- Jest - Test framework
- Supertest - API testing
- React Testing Library - UI testing
- MongoDB Memory Server - Test database

### Tính năng chính

✅ **Character System** - 5 classes, level 1-400, stat allocation  
✅ **Combat System** - Real-time PvE, skills, auto-attack, monster AI  
✅ **Item System** - Weapons, armor, accessories, 5 rarity tiers  
✅ **Inventory** - Grid-based (8x8), drag-and-drop  
✅ **Skills** - Skill trees per class, hotbar (1-9 keys), cooldowns  
✅ **Social** - Chat (global/party/guild/whisper), party system, guilds  
✅ **Economy** - NPC shops, player trading, auction house  
✅ **PvP** - Duels, PK system, GvG wars  
✅ **Progression** - Item enhancement (+0 to +15), socket system  
✅ **Content** - Multiple maps, boss fights, dungeons  

---

## 📊 PROJECT STATUS

### Current Phase
```
🔄 Phase 1: Core Foundation - 0/18 tasks (0%)
```

### Overall Progress
```
Total: 0/107 tasks completed (0%)
Test Coverage: 0% (Target: 80%)
```

### Timeline
- **Estimated Duration**: 10-15 tuần (2.5-4 tháng)
- **Start Date**: [TBD]
- **Expected Completion**: [TBD]

---

## 🚀 QUICK START

### Để bắt đầu dự án:

```bash
# 1. Đọc tài liệu
cat START-HERE.md

# 2. Bắt đầu với Agent
"Agent, hãy đọc file START-HERE.md và bắt đầu Phase 1, Task 1.1: Project Setup"
```

### Hoặc setup manual:

```bash
# Clone repository (nếu có)
git clone <repo-url>

# Setup client
npx create-react-app client
cd client
npm install three @react-three/fiber socket.io-client
npm install @reduxjs/toolkit react-redux axios

# Setup server
cd ../server
npm init -y
npm install express socket.io mongoose dotenv bcrypt jsonwebtoken
npm install jest supertest --save-dev

# Start development
cd client && npm start
cd server && npm run dev
```

---

## 📁 PROJECT STRUCTURE

```
project-root/
├── client/                    # Frontend (React + Three.js)
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── UI/           # Inventory, Chat, Hotbar, etc.
│   │   │   ├── Auth/         # Login, Register
│   │   │   └── Game/         # Game-specific components
│   │   ├── game/             # Game engine
│   │   │   ├── entities/     # Player, Monster, NPC
│   │   │   ├── systems/      # Combat, Movement, Inventory
│   │   │   └── utils/        # Pathfinding, Collision
│   │   ├── network/          # Socket.io client
│   │   ├── store/            # Redux store
│   │   └── tests/            # Frontend tests
│   └── package.json
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   ├── game/             # Game server logic
│   │   │   ├── systems/      # Combat, Drop, Spawn
│   │   │   ├── data/         # JSON data files
│   │   │   └── World.js      # Game world manager
│   │   ├── socket/           # Socket.io handlers
│   │   └── tests/            # Backend tests
│   └── package.json
│
├── shared/                    # Shared code (constants, types)
│   └── constants.js
│
├── docs/                      # Documentation
│   ├── START-HERE.md
│   ├── game-implementation-checklist.md
│   ├── game-muonline-spec.md
│   ├── testing-guidelines.md
│   └── QUICK-REFERENCE.md
│
└── README.md                  # This file
```

---

## 🧪 TESTING

### Run Tests

```bash
# Backend tests
cd server
npm test                    # All tests
npm run test:coverage       # With coverage
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only

# Frontend tests
cd client
npm test                    # All tests
npm run test:coverage       # With coverage
```

### Coverage Requirements

- **Overall**: Minimum 80%
- **Critical paths** (Auth, Trading, Combat): 100%
- **Business logic**: 90%+
- **UI components**: 70%+

### Testing Guidelines

Xem chi tiết trong [testing-guidelines.md](./testing-guidelines.md)

---

## 📈 DEVELOPMENT WORKFLOW

### Workflow cho mỗi Task:

1. ✅ Đọc task requirements từ checklist
2. 💻 Implement feature
3. 🧪 Write unit tests (minimum 5 test cases)
4. ✅ Run tests: `npm test`
5. ✅ Check coverage: `npm run test:coverage`
6. ✅ Ensure coverage >= 80%
7. ✅ Mark checkbox `[x]` in checklist
8. ✅ Commit: `git commit -m "feat: task description"`
9. ✅ Move to next task

### Git Commit Convention

```bash
feat: implement user authentication
test: add combat system unit tests
fix: resolve inventory drag-and-drop bug
docs: update API documentation
refactor: optimize pathfinding algorithm
perf: improve 3D rendering performance
```

---

## 🎮 GAME FEATURES BREAKDOWN

### Phase 1: Core Foundation (2-3 tuần)
- Project setup
- 3D rendering basics
- Authentication system
- Character creation

### Phase 2: Movement & Combat (2-3 tuần)
- Click-to-move pathfinding
- Monster AI
- Combat system
- EXP and leveling

### Phase 3: Items & Inventory (2 tuần)
- Inventory UI (drag-and-drop)
- Equipment system
- Item stats

### Phase 4: Skills & Advanced Combat (2 tuần)
- Skill system per class
- Hotbar (1-9 keys)
- Skill effects & animations

### Phase 5: Social Features (1-2 tuần)
- Chat system (multiple channels)
- Party system
- Friend list

### Phase 6: Economy & Trading (1-2 tuần)
- NPC shops
- Player-to-player trading
- Auction house (optional)

### Phase 7: Advanced Features (2-3 tuần)
- Guild system
- PvP (duels, PK)
- Item enhancement
- Boss fights
- Multiple maps

### Phase 8: Polish & Optimization (1-2 tuần)
- Performance optimization
- Bug fixes
- Balance tuning
- UI/UX improvements

---

## 🔐 SECURITY

- ✅ Passwords hashed với bcrypt
- ✅ JWT authentication
- ✅ Input validation on server
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ HTTPS in production

---

## 📊 PERFORMANCE TARGETS

- **Client FPS**: 60 FPS với 50 entities on screen
- **Server Response**: <100ms under normal load
- **Concurrent Players**: 100+ players simultaneously
- **Memory**: Stable over 8-hour sessions
- **Network**: <50KB/s per player

---

## 🤝 CONTRIBUTION GUIDELINES

### For Agents

1. Đọc [START-HERE.md](./START-HERE.md) trước
2. Follow checklist trong [game-implementation-checklist.md](./game-implementation-checklist.md)
3. Viết tests cho mọi feature (80% coverage)
4. Mark tasks `[x]` khi hoàn thành
5. Commit với proper messages
6. Report progress thường xuyên

### For Humans

1. Review agent's work
2. Test manually
3. Approve Phase completion
4. Provide feedback

---

## 📞 SUPPORT & RESOURCES

### Documentation
- [Three.js Docs](https://threejs.org/docs/)
- [Socket.io Docs](https://socket.io/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Jest Docs](https://jestjs.io/docs/getting-started)

### Tools
- VSCode + Extensions (ESLint, Prettier, GitLens)
- MongoDB Compass
- Postman (API testing)
- Chrome DevTools

---

## 📝 LICENSE

[MIT License](./LICENSE) - Feel free to use this project for learning

---

## 🎉 LET'S BUILD!

**Ready to start?** 🚀

```
"Agent, hãy đọc START-HERE.md và bắt đầu Phase 1!"
```

---

## 📌 IMPORTANT NOTES

⚠️ **Đây là dự án lớn** - Cần 10-15 tuần để hoàn thành  
⚠️ **Tests không optional** - 80% coverage là bắt buộc  
⚠️ **Security first** - Validate mọi input từ client  
⚠️ **Performance matters** - Target 60 FPS  
⚠️ **Quality > Speed** - Làm đúng quan trọng hơn làm nhanh  

---

**Last Updated**: [Date]  
**Version**: 1.0.0  
**Status**: 🚧 In Development
