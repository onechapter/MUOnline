# Đặc tả Game MMORPG giống MU Online - Web Version

## 1. TỔNG QUAN DỰ ÁN

### Mô tả
Xây dựng một game nhập vai trực tuyến nhiều người chơi (MMORPG) lấy cảm hứng từ MU Online, chạy trên trình duyệt web với đồ họa 3D, hệ thống chiến đấu real-time, và các tính năng xã hội.

### Công nghệ chính
- **Frontend**: Three.js hoặc Babylon.js (đồ họa 3D)
- **Backend**: Node.js + Express hoặc NestJS
- **Database**: MongoDB hoặc PostgreSQL
- **Real-time**: Socket.io hoặc WebSocket
- **Game Engine**: Phaser 3 (tùy chọn) hoặc custom engine
- **Authentication**: JWT + bcrypt

---

## 2. CÁC TÍNH NĂNG CHÍNH

### 2.1. Hệ thống nhân vật (Character System)
- [ ] **Tạo nhân vật**
  - Chọn class: Dark Knight, Dark Wizard, Elf, Magic Gladiator, Dark Lord
  - Tùy chỉnh tên, ngoại hình cơ bản
  - Thuộc tính ban đầu: HP, MP, Strength, Agility, Vitality, Energy

- [ ] **Hệ thống level và kinh nghiệm**
  - Cấp độ từ 1 đến 400
  - Công thức tính EXP cần thiết để lên cấp
  - Cơ chế reset nhân vật (rebirth)
  - Điểm kỹ năng (skill points) khi lên cấp

- [ ] **Thuộc tính (Stats)**
  - Strength (sức mạnh): tăng damage vật lý
  - Agility (nhanh nhẹn): tăng tốc độ tấn công, defense
  - Vitality (sinh lực): tăng HP
  - Energy (năng lượng): tăng MP, magic damage
  - Hệ thống phân phối điểm tự do

### 2.2. Hệ thống chiến đấu (Combat System)
- [ ] **Chiến đấu PvE**
  - Click để di chuyển (pathfinding)
  - Click vào monster để tấn công
  - Auto-attack khi đứng gần monster
  - Skill cooldown system
  - Damage calculation: base damage + weapon + stats

- [ ] **Kỹ năng (Skills)**
  - Skill tree cho từng class
  - Hotkey bar (1-9 keys)
  - Mana cost cho mỗi skill
  - Animation effects
  - AOE skills, single target skills, buff skills

- [ ] **Monster AI**
  - Spawn system theo map zones
  - Aggro range (phạm vi phát hiện người chơi)
  - Chase behavior (đuổi theo người chơi)
  - Return to spawn point
  - Drop items và exp khi chết

- [ ] **Boss System**
  - Special boss monsters
  - Boss spawn timer
  - Multi-phase boss fights
  - Rare loot drops

### 2.3. Hệ thống vật phẩm (Item System)
- [ ] **Loại vật phẩm**
  - Weapons (kiếm, cung, gậy, v.v.)
  - Armor (mũ, áo, quần, găng, giày)
  - Accessories (nhẫn, dây chuyền, cánh)
  - Consumables (potion HP/MP, buff items)
  - Materials (nguyên liệu craft)

- [ ] **Thuộc tính vật phẩm**
  - Rarity: Normal, Magic, Rare, Legendary, Ancient
  - Level requirement
  - Stats bonus (+damage, +defense, +HP, etc.)
  - Options (random stats)
  - Durability system

- [ ] **Inventory System**
  - Grid-based inventory (8x8 hoặc 10x10)
  - Drag and drop items
  - Item stacking
  - Weight limit
  - Personal storage (vault)

- [ ] **Equipment System**
  - Equipment slots: Weapon, Helmet, Armor, Pants, Gloves, Boots, Wings, Rings, Pendant
  - Visual update khi trang bị
  - Stat calculation từ equipment

### 2.4. Hệ thống chế tạo và nâng cấp (Crafting & Upgrade)
- [ ] **Item Enhancement**
  - Nâng cấp từ +0 đến +15
  - Success rate giảm dần theo level
  - Item có thể vỡ khi thất bại
  - Jewel system (Bless, Soul, Chaos)

- [ ] **Socket System**
  - Thêm socket vào item
  - Gắn gems vào socket
  - Bonus stats từ gems

- [ ] **Crafting**
  - Combine items để tạo item mới
  - Recipe system
  - Success rate

### 2.5. Hệ thống bản đồ (Map System)
- [ ] **Maps**
  - Lorencia (town - safe zone)
  - Dungeon (các tầng khác nhau)
  - Devias, Noria, Atlans (các thành khác)
  - Tarkan, Icarus, Aida (map level cao)

- [ ] **Map Features**
  - Collision detection
  - Safe zones (không PvP)
  - Teleport points
  - Minimap
  - Fog of war (tùy chọn)

### 2.6. Hệ thống xã hội (Social System)
- [ ] **Chat System**
  - Global chat
  - Party chat
  - Guild chat
  - Private message (whisper)
  - Trade chat

- [ ] **Party System**
  - Tạo và tham gia party (tối đa 5 người)
  - Chia exp theo tỷ lệ
  - Shared loot options
  - Party leader controls

- [ ] **Guild System**
  - Tạo guild (cần gold)
  - Guild ranks
  - Guild storage
  - Guild vs Guild (GvG)
  - Guild emblems

- [ ] **Friend System**
  - Add/remove friends
  - Online status
  - Quick whisper

### 2.7. Hệ thống PvP
- [ ] **Duel System**
  - Request duel
  - Duel trong safe zone riêng
  - No items lost

- [ ] **PK System**
  - Player killing trong map nguy hiểm
  - PK status (tên đỏ)
  - Drop items khi chết (nếu PK)

- [ ] **Arena/Battleground**
  - Scheduled events
  - Team vs Team
  - Rewards system

### 2.8. Hệ thống kinh tế (Economy)
- [ ] **Currency**
  - Gold (Zen)
  - Premium currency (Wcoin - tùy chọn)

- [ ] **NPC Shop**
  - Buy/sell items
  - Repair equipment
  - Potion vendors

- [ ] **Player Trading**
  - Trade window
  - Item + Gold exchange
  - Confirmation system

- [ ] **Auction House**
  - List items for sale
  - Search và filter
  - Bid system hoặc buyout

---

## 3. KẾ HOẠCH TRIỂN KHAI

### Phase 1: Core Foundation (2-3 tuần)
1. **Setup project structure**
   - Frontend: React + Three.js/Babylon.js
   - Backend: Node.js + Express + Socket.io
   - Database: MongoDB setup

2. **Basic 3D rendering**
   - Camera system (isometric view)
   - Character model loading
   - Basic animation (idle, walk, attack)
   - Map terrain rendering

3. **Authentication system**
   - Register/Login
   - JWT token
   - Session management

4. **Character creation**
   - Class selection UI
   - Save character to database
   - Character list screen

### Phase 2: Movement & Combat (2-3 tuần)
5. **Movement system**
   - Click-to-move
   - Pathfinding algorithm (A*)
   - Collision detection
   - Smooth character movement

6. **Basic combat**
   - Auto-attack system
   - Monster spawning
   - Monster AI (idle, aggro, chase, attack)
   - Damage calculation
   - HP/MP bars

7. **Monster drops**
   - Drop table system
   - Loot pickup
   - EXP gain
   - Level up

### Phase 3: Items & Inventory (2 tuần)
8. **Inventory system**
   - Grid-based UI
   - Drag and drop
   - Item database
   - Item icons và tooltips

9. **Equipment system**
   - Equipment slots
   - Wear/remove items
   - Stat calculation
   - Visual equipment update

### Phase 4: Skills & Advanced Combat (2 tuần)
10. **Skill system**
    - Skill database theo class
    - Hotkey bar
    - Skill activation
    - Cooldown system
    - MP consumption

11. **Skill effects**
    - Particle effects
    - Sound effects
    - AOE detection
    - Buff/debuff system

### Phase 5: Social Features (1-2 tuần)
12. **Chat system**
    - Multiple chat channels
    - Chat UI
    - Real-time messaging

13. **Party system**
    - Create/join party
    - Party UI
    - Shared EXP

### Phase 6: Economy & Trading (1-2 tuần)
14. **NPC shops**
    - Shop UI
    - Buy/sell mechanics
    - Repair system

15. **Player trading**
    - Trade window
    - Trade verification

### Phase 7: Advanced Features (2-3 tuần)
16. **Guild system**
17. **PvP system**
18. **Item enhancement**
19. **Boss system**
20. **Multiple maps**

### Phase 8: Polish & Optimization (1-2 tuần)
21. **Performance optimization**
22. **Bug fixes**
23. **Balance tuning**
24. **UI/UX improvements**

---

## 4. CẤU TRÚC CODE DỰ KIẾN

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── UI/
│   │   │   ├── CharacterStats.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Hotbar.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Minimap.jsx
│   │   │   └── TargetInfo.jsx
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── CharacterSelect/
│   │       └── CharacterSelect.jsx
│   ├── game/
│   │   ├── GameEngine.js
│   │   ├── InputManager.js
│   │   ├── Camera.js
│   │   ├── entities/
│   │   │   ├── Player.js
│   │   │   ├── Monster.js
│   │   │   └── NPC.js
│   │   ├── systems/
│   │   │   ├── MovementSystem.js
│   │   │   ├── CombatSystem.js
│   │   │   ├── SkillSystem.js
│   │   │   └── InventorySystem.js
│   │   └── utils/
│   │       ├── Pathfinding.js
│   │       └── CollisionDetection.js
│   ├── network/
│   │   ├── SocketManager.js
│   │   └── NetworkEvents.js
│   ├── store/
│   │   ├── characterSlice.js
│   │   ├── inventorySlice.js
│   │   └── gameSlice.js
│   └── App.jsx
```

### Backend Structure
```
server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── characterController.js
│   │   └── gameController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Character.js
│   │   ├── Item.js
│   │   └── Monster.js
│   ├── game/
│   │   ├── GameServer.js
│   │   ├── World.js
│   │   ├── Map.js
│   │   ├── systems/
│   │   │   ├── CombatSystem.js
│   │   │   ├── MovementSystem.js
│   │   │   ├── DropSystem.js
│   │   │   └── SpawnSystem.js
│   │   └── data/
│   │       ├── monsters.json
│   │       ├── items.json
│   │       ├── skills.json
│   │       └── maps.json
│   ├── socket/
│   │   ├── socketHandler.js
│   │   └── events/
│   │       ├── movementEvents.js
│   │       ├── combatEvents.js
│   │       └── chatEvents.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── character.js
│   │   └── game.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   └── server.js
```

---

## 5. YÊU CẦU KỸ THUẬT CHI TIẾT

### 5.1. Real-time Communication
```javascript
// Socket events cần implement
- 'player:move' - Di chuyển nhân vật
- 'player:attack' - Tấn công
- 'player:useSkill' - Sử dụng skill
- 'monster:spawn' - Monster xuất hiện
- 'monster:death' - Monster chết
- 'item:drop' - Vật phẩm rơi
- 'item:pickup' - Nhặt vật phẩm
- 'chat:message' - Chat message
- 'party:invite' - Mời vào party
- 'trade:request' - Yêu cầu trade
```

### 5.2. Database Schema

#### User Schema
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  characters: [ObjectId]
}
```

#### Character Schema
```javascript
{
  userId: ObjectId,
  name: String,
  class: String,
  level: Number,
  experience: Number,
  stats: {
    strength: Number,
    agility: Number,
    vitality: Number,
    energy: Number,
    points: Number
  },
  currentHP: Number,
  currentMP: Number,
  position: {
    mapId: String,
    x: Number,
    y: Number,
    z: Number
  },
  inventory: [ItemSchema],
  equipment: {
    weapon: ItemSchema,
    helmet: ItemSchema,
    armor: ItemSchema,
    pants: ItemSchema,
    gloves: ItemSchema,
    boots: ItemSchema,
    wings: ItemSchema,
    ring1: ItemSchema,
    ring2: ItemSchema,
    pendant: ItemSchema
  },
  skills: [SkillSchema],
  gold: Number
}
```

#### Item Schema
```javascript
{
  itemId: String,
  name: String,
  type: String,
  level: Number,
  rarity: String,
  enhancement: Number,
  options: [String],
  durability: Number,
  slot: String
}
```

### 5.3. Game Loop
```javascript
// Server-side game loop (60 ticks/second)
- Update monster AI
- Process movement
- Calculate combat
- Check collisions
- Update skills cooldowns
- Broadcast updates to clients
```

---

## 6. UI/UX MOCKUP MÔ TẢ

### Main Game Screen
```
┌─────────────────────────────────────────────────────────────┐
│ [HP: ████████░░] [MP: ██████░░░░]  LV: 50    EXP: ████░░░░░ │
├─────────────────────────────────────────────────────────────┤
│                                                    ┌────────┐│
│                                                    │ Target ││
│                                                    │  [HP]  ││
│                  GAME VIEW                         │ ████░░ ││
│              (3D Character + Map)                  └────────┘│
│                                                    ┌────────┐│
│                                                    │ Mini   ││
│                                                    │ Map    ││
│                                                    └────────┘│
├─────────────────────────────────────────────────────────────┤
│ [1] [2] [3] [4] [5] [6] [7] [8] [9]    Chat: [___________] │
│  Skill Hotbar                          [Send]               │
└─────────────────────────────────────────────────────────────┘
```

### Inventory Screen
```
┌─────────────────────────────────────────┐
│         CHARACTER & INVENTORY           │
├──────────────┬──────────────────────────┤
│   [Helmet]   │  ┌─┬─┬─┬─┬─┬─┬─┬─┐      │
│              │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│   [Weapon]   │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│              │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│   [Armor]    │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│              │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│   [Pants]    │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│              │  ├─┼─┼─┼─┼─┼─┼─┼─┤      │
│   [Boots]    │  └─┴─┴─┴─┴─┴─┴─┴─┘      │
│              │                          │
│ STR: 200 [+] │  Gold: 1,234,567        │
│ AGI: 150 [+] │                          │
│ VIT: 180 [+] │                          │
│ ENE: 100 [+] │                          │
└──────────────┴──────────────────────────┘
```

---

## 7. CÔNG THỨC GAME DESIGN

### Damage Calculation
```
Physical Damage = (Strength / 6) + Weapon Damage + Enhancement Bonus
Magic Damage = (Energy / 9) + Weapon Magic Damage + Enhancement Bonus
Final Damage = Base Damage * (1 - Defense / (Defense + 100))
Critical Hit = Random(0-100) < (Agility / 30) ? Damage * 1.5 : Damage
```

### Experience Calculation
```
EXP Required = Level * Level * Level * 10 + 1000
EXP Gained = Monster Base EXP * (1 + Level Difference * 0.1)
```

### Drop Rate
```
Common: 50%
Magic: 30%
Rare: 15%
Legendary: 4%
Ancient: 1%
```

---

## 8. TESTING REQUIREMENTS

⚠️ **QUAN TRỌNG**: Mỗi Phase phải có Unit Tests và Integration Tests với coverage >= 80%

### Testing Framework
- **Backend**: Jest + Supertest + MongoDB Memory Server
- **Frontend**: Jest + React Testing Library
- **E2E**: Cypress hoặc Playwright (optional)

### Testing Checklist Per Phase

#### Manual Testing
- [ ] Character creation và login
- [ ] Di chuyển mượt mà không lag
- [ ] Combat system hoạt động chính xác
- [ ] Item pickup và inventory
- [ ] Equipment stats calculation đúng
- [ ] Skills cast và cooldown
- [ ] Monster AI responsive
- [ ] Chat real-time
- [ ] Party system
- [ ] Trading system
- [ ] Data persistence (save/load)
- [ ] Multiple players cùng lúc (stress test)
- [ ] Security (SQL injection, XSS prevention)

#### Automated Testing
- [ ] Unit tests coverage >= 80%
- [ ] Integration tests cho user flows
- [ ] Performance tests (load, stress)
- [ ] Security tests (auth, injection)

**Chi tiết**: Xem file `testing-guidelines.md` và `game-implementation-checklist.md`

---

## 9. BẮT ĐẦU THẾ NÀO?

Hãy bắt đầu với lệnh:

**"Xin chào Agent, hãy bắt đầu Phase 1 của dự án game MMORPG. Trước tiên, hãy tạo cấu trúc thư mục cho cả frontend và backend, sau đó setup project với các dependencies cần thiết."**

Hoặc nếu muốn chi tiết hơn:

**"Hãy đọc file game-muonline-spec.md và bắt đầu với Phase 1, Task 1: Setup project structure. Tạo folder client với React + Three.js, folder server với Node.js + Express + Socket.io, và setup MongoDB connection."**

---

## 10. GHI CHÚ QUAN TRỌNG

⚠️ **Đây là dự án lớn** - Dự kiến 10-15 tuần để hoàn thiện đầy đủ
⚠️ **Tối ưu hóa** - Cần chú ý performance khi có nhiều player
⚠️ **Bảo mật** - Validate tất cả input từ client, không trust client-side
⚠️ **Scalability** - Xem xét dùng Redis cho session, clustering cho server
⚠️ **Asset** - Cần 3D models, textures, sounds (có thể dùng free assets ban đầu)

---

## TÀI NGUYÊN THAM KHẢO

- Three.js Documentation: https://threejs.org/docs/
- Babylon.js: https://www.babylonjs.com/
- Socket.io: https://socket.io/docs/
- Game Development Patterns
- MMORPG Architecture Best Practices
