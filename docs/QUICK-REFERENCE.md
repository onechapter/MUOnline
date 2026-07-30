# ⚡ QUICK REFERENCE - COMMANDS & FORMULAS

> Tham khảo nhanh cho Agent khi làm việc

---

## 📦 NPM COMMANDS

### Project Setup
```bash
# Client setup (React + Three.js)
npx create-react-app client
cd client
npm install three @react-three/fiber @react-three/drei
npm install socket.io-client axios react-router-dom
npm install @reduxjs/toolkit react-redux

# Server setup
cd ../server
npm init -y
npm install express socket.io mongoose dotenv bcrypt jsonwebtoken cors
npm install nodemon --save-dev

# Testing frameworks
npm install jest supertest mongodb-memory-server --save-dev
npm install @testing-library/react @testing-library/jest-dom --save-dev
```

### Run Commands
```bash
# Development
npm run dev          # Start dev server
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run with coverage report
npm run test:unit    # Run unit tests only
npm run test:integration # Run integration tests only

# Code Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

---

## 🎮 GAME FORMULAS

### Damage Calculation
```javascript
// Physical Damage
physicalDamage = (Strength / 6) + weaponDamage + enhancementBonus

// Magic Damage  
magicDamage = (Energy / 9) + weaponMagicDamage + enhancementBonus

// Defense Reduction
finalDamage = baseDamage * (1 - defense / (defense + 100))

// Critical Hit (Chance = Agility / 30)
criticalDamage = baseDamage * 1.5

// Enhancement Bonus
enhancementBonus = baseDamage * (0.05 * enhancementLevel) // +5% per level
```

### Experience & Leveling
```javascript
// EXP Required to Level Up
expRequired = (level * level * level * 10) + 1000

// EXP Gained from Monster
expGained = monsterBaseExp * (1 + (monsterLevel - playerLevel) * 0.1)

// Stat Points on Level Up
statPoints = 5 // per level

// Party EXP Share
memberExp = totalExp / partySize // Equal split
// OR
memberExp = totalExp * (memberDamage / totalDamage) // Contribution-based
```

### Drop Rates
```javascript
// Item Rarity Drop Chance
const dropRates = {
  common: 0.50,      // 50%
  magic: 0.30,       // 30%
  rare: 0.15,        // 15%
  legendary: 0.04,   // 4%
  ancient: 0.01      // 1%
};

// Gold Drop
goldDrop = monsterLevel * random(10, 20)
```

### Enhancement System
```javascript
// Success Rate by Enhancement Level
const successRates = {
  0: 1.00,   // +0 to +1: 100%
  1: 1.00,   // +1 to +2: 100%
  2: 1.00,   // +2 to +3: 100%
  3: 1.00,   // +3 to +4: 100%
  4: 1.00,   // +4 to +5: 100%
  5: 1.00,   // +5 to +6: 100%
  6: 1.00,   // +6 to +7: 100%
  7: 0.50,   // +7 to +8: 50%
  8: 0.40,   // +8 to +9: 40%
  9: 0.30,   // +9 to +10: 30%
  10: 0.20,  // +10 to +11: 20%
  11: 0.10,  // +11 to +12: 10%
  12: 0.05,  // +12 to +13: 5%
  13: 0.02,  // +13 to +14: 2%
  14: 0.01   // +14 to +15: 1%
};

// Jewel Effects
// Bless: Prevents item destruction on failure
// Soul: +5% success rate
// Chaos: Random +1 to +4 enhancement (100% success)
```

---

## 🗄️ DATABASE SCHEMAS CHEAT SHEET

### User Model
```javascript
{
  username: String (unique, 3-12 chars),
  email: String (unique, valid email),
  password: String (hashed, bcrypt salt 10),
  createdAt: Date,
  characters: [ObjectId] (ref: Character)
}
```

### Character Model
```javascript
{
  userId: ObjectId (ref: User),
  name: String (unique, 3-12 chars),
  class: String (enum: ['Dark Knight', 'Dark Wizard', 'Elf', 'Magic Gladiator', 'Dark Lord']),
  level: Number (1-400),
  experience: Number,
  stats: {
    strength: Number,
    agility: Number,
    vitality: Number,
    energy: Number,
    points: Number (unallocated)
  },
  maxHP: Number,
  maxMP: Number,
  currentHP: Number,
  currentMP: Number,
  position: {
    mapId: String,
    x: Number,
    y: Number,
    z: Number
  },
  inventory: [{
    itemId: String,
    position: { x: Number, y: Number },
    quantity: Number,
    enhancement: Number,
    options: [String]
  }],
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
  skills: [{ skillId: String, level: Number }],
  gold: Number,
  partyId: ObjectId (ref: Party),
  guildId: ObjectId (ref: Guild)
}
```

### Item Model
```javascript
{
  itemId: String (unique),
  name: String,
  type: String (enum: ['Weapon', 'Armor', 'Accessory', 'Consumable', 'Material']),
  subType: String (e.g., 'Sword', 'Bow', 'Staff'),
  level: Number (requirement),
  rarity: String (enum: ['Normal', 'Magic', 'Rare', 'Legendary', 'Ancient']),
  stats: {
    damage: Number,
    defense: Number,
    hp: Number,
    mp: Number,
    strength: Number,
    agility: Number,
    vitality: Number,
    energy: Number
  },
  durability: { current: Number, max: Number },
  price: Number,
  stackable: Boolean,
  maxStack: Number
}
```

### Monster Model
```javascript
{
  monsterId: String (unique),
  name: String,
  level: Number,
  hp: Number,
  mp: Number,
  attack: Number,
  defense: Number,
  aggroRange: Number (default: 15),
  attackRange: Number (default: 2),
  moveSpeed: Number,
  attackSpeed: Number,
  expReward: Number,
  goldReward: { min: Number, max: Number },
  dropTable: [{
    itemId: String,
    chance: Number
  }],
  skills: [String]
}
```

---

## 🔌 SOCKET.IO EVENTS

### Client → Server
```javascript
// Authentication
socket.emit('auth:login', { token })

// Movement
socket.emit('player:move', { targetX, targetY, targetZ })

// Combat
socket.emit('player:attack', { targetId })
socket.emit('player:useSkill', { skillId, targetId })

// Items
socket.emit('item:pickup', { itemId })
socket.emit('item:use', { itemId })
socket.emit('item:equip', { itemId, slot })
socket.emit('item:unequip', { slot })

// Chat
socket.emit('chat:message', { channel, message })

// Party
socket.emit('party:create')
socket.emit('party:invite', { targetId })
socket.emit('party:accept', { partyId })
socket.emit('party:leave')

// Trading
socket.emit('trade:request', { targetId })
socket.emit('trade:addItem', { itemId })
socket.emit('trade:addGold', { amount })
socket.emit('trade:ready')
socket.emit('trade:cancel')
```

### Server → Client
```javascript
// Player updates
socket.on('player:update', (data) => {})
socket.on('player:levelUp', (data) => {})
socket.on('player:died', (data) => {})

// Other players
socket.on('players:nearby', (players) => {})
socket.on('player:joined', (player) => {})
socket.on('player:left', (playerId) => {})

// Combat
socket.on('combat:damage', (data) => {})
socket.on('combat:critical', (data) => {})
socket.on('skill:used', (data) => {})

// Monsters
socket.on('monsters:spawn', (monsters) => {})
socket.on('monster:update', (monster) => {})
socket.on('monster:died', (data) => {})

// Items
socket.on('item:dropped', (item) => {})
socket.on('inventory:update', (inventory) => {})

// Chat
socket.on('chat:message', (message) => {})

// Notifications
socket.on('notification', { type, message })
```

---

## 🧪 TEST ASSERTIONS CHEAT SHEET

### Jest Matchers
```javascript
// Equality
expect(value).toBe(expected)              // Strict equality (===)
expect(value).toEqual(expected)           // Deep equality
expect(value).not.toBe(expected)          // Not equal

// Truthiness
expect(value).toBeTruthy()                // Truthy value
expect(value).toBeFalsy()                 // Falsy value
expect(value).toBeNull()                  // Exactly null
expect(value).toBeUndefined()             // Exactly undefined
expect(value).toBeDefined()               // Not undefined

// Numbers
expect(value).toBeGreaterThan(3)          // > 3
expect(value).toBeGreaterThanOrEqual(3)   // >= 3
expect(value).toBeLessThan(5)             // < 5
expect(value).toBeLessThanOrEqual(5)      // <= 5
expect(value).toBeCloseTo(0.3, 2)         // ~0.3 (2 decimal places)

// Strings
expect(string).toMatch(/pattern/)         // Regex match
expect(string).toContain('substring')     // Contains substring

// Arrays
expect(array).toContain(item)             // Contains item
expect(array).toHaveLength(3)             // Length is 3

// Objects
expect(object).toHaveProperty('key')      // Has property
expect(object).toHaveProperty('key', value) // Has property with value
expect(object).toMatchObject({ key: value }) // Partial match

// Exceptions
expect(() => fn()).toThrow()              // Throws error
expect(() => fn()).toThrow(Error)         // Throws specific error
expect(() => fn()).toThrow('message')     // Throws with message

// Async
await expect(promise).resolves.toBe(value)    // Promise resolves to value
await expect(promise).rejects.toThrow()       // Promise rejects

// Mocks
expect(mockFn).toHaveBeenCalled()             // Called at least once
expect(mockFn).toHaveBeenCalledTimes(3)       // Called exactly 3 times
expect(mockFn).toHaveBeenCalledWith(arg1, arg2) // Called with args
```

### React Testing Library
```javascript
// Queries
screen.getByText('text')                  // Throws if not found
screen.queryByText('text')                // Returns null if not found
screen.findByText('text')                 // Async, waits for element

// User Events
fireEvent.click(element)
fireEvent.change(input, { target: { value: 'text' } })
fireEvent.submit(form)

// Async
await waitFor(() => expect(element).toBeInTheDocument())

// Assertions
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveTextContent('text')
expect(element).toHaveClass('className')
expect(element).toHaveAttribute('attr', 'value')
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Passwords hashed với bcrypt (salt rounds: 10)
- [ ] JWT tokens với expiration (24h)
- [ ] Auth middleware validates tokens
- [ ] Input validation trên server (never trust client)
- [ ] SQL injection prevention (use Mongoose/parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CORS configured correctly
- [ ] Rate limiting for API endpoints
- [ ] HTTPS in production
- [ ] Environment variables for secrets (.env file)
- [ ] Error messages don't leak sensitive info

---

## 🎨 COMMON THREE.JS PATTERNS

### Setup Scene
```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

### Load Character Model
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/models/character.glb', (gltf) => {
  const character = gltf.scene;
  scene.add(character);
});
```

### Animation
```javascript
const mixer = new THREE.AnimationMixer(character);
const action = mixer.clipAction(gltf.animations[0]);
action.play();

// In game loop
mixer.update(deltaTime);
```

### Game Loop
```javascript
function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  mixer.update(deltaTime);
  
  renderer.render(scene, camera);
}
animate();
```

---

## 📐 COORDINATE SYSTEM

### Map Grid
```
(0,0) ──────────► X (East)
  │
  │
  │
  ▼
  Z (South)
```

### Character Positions
```javascript
// Starting position (Lorencia town center)
const startPosition = { x: 128, y: 0, z: 128 };

// Map boundaries (256x256 grid)
const mapBounds = {
  minX: 0,
  maxX: 256,
  minZ: 0,
  maxZ: 256
};
```

---

## 🚀 GIT WORKFLOW

```bash
# Feature branch
git checkout -b feature/task-1-1-project-setup

# Commit conventions
git commit -m "feat: implement user registration"
git commit -m "test: add auth unit tests"
git commit -m "fix: resolve inventory bug"
git commit -m "docs: update README"

# Push và create PR
git push origin feature/task-1-1-project-setup
```

---

**🎯 Keep this file open for quick reference while coding! 🎯**
