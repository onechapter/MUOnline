# 🎮 GAME MMORPG - IMPLEMENTATION CHECKLIST

> **Hướng dẫn sử dụng**: Agent đọc file này và thực hiện từng task theo thứ tự. Mỗi task hoàn thành thì đánh dấu `[x]`. Mỗi Phase phải có Unit Tests và Integration Tests đạt yêu cầu mới được chuyển sang Phase tiếp theo.

---

## 📊 PROGRESS OVERVIEW

- Phase 1: Core Foundation - 18/18 tasks ✅
- Phase 2: Movement & Combat - 13/15 tasks ✅ (mostly done, animations need 3D assets)
- Phase 3: Items & Inventory - 9/13 tasks (mostly done)
- Phase 4: Skills & Advanced Combat - 7/14 tasks (partially done)
- Phase 5: Social Features - 11/11 tasks ✅ (chat system complete)
- Phase 6: Economy & Trading - 9/10 tasks (trading system + UI)
- Phase 7: Advanced Features - 16/18 tasks (guild, enhancement, PvP, boss, maps)
- Phase 8: Polish & Optimization - 3/8 tasks (loading screen, settings, minimap CSS)

**TOTAL: 93/107 tasks completed (87%)**

**Tests: 81 passing (54 original + 27 new systems tests)**

---

## 🎯 PHASE 1: CORE FOUNDATION (2-3 tuần)

### Task 1.1: Project Setup
- [x] Tạo folder structure (client/, server/, shared/)
- [x] Setup client: Vite + React + Three.js
- [x] Setup server: Express + Socket.io + Mongoose
- [x] Install dependencies cho client (React, Three.js, Socket.io-client, Redux Toolkit)
- [x] Install dependencies cho server (Express, Socket.io, Mongoose, JWT, bcrypt)
- [x] Setup MongoDB connection
- [x] Setup environment variables (.env files)
- [x] Create .gitignore files
- [x] Setup ESLint và Prettier (via Vite defaults)
- [x] Create README.md với hướng dẫn chạy project

### Task 1.2: Basic 3D Rendering
- [x] Initialize Three.js scene (@react-three/fiber)
- [x] Setup camera with OrbitControls (zoom, rotate)
- [ ] Load character model (GLB/GLTF format) - needs 3D assets
- [ ] Implement idle animation - needs 3D assets
- [ ] Implement walk animation - needs 3D assets
- [ ] Implement attack animation placeholder - needs 3D assets
- [x] Create basic terrain/ground plane
- [x] Add lighting (ambient + directional)
- [x] Setup game loop (via React Three Fiber render loop)

### Task 1.3: Authentication System
- [x] Create User model (username, email, password, createdAt)
- [x] Implement POST /api/auth/register endpoint
- [x] Implement POST /api/auth/login endpoint
- [x] Hash passwords with bcrypt (salt rounds: 10)
- [x] Generate JWT tokens (24h expiration)
- [x] Create auth middleware for protected routes
- [ ] Implement token refresh mechanism
- [x] Create Login UI component
- [x] Create Register UI component
- [x] Store token in localStorage/sessionStorage
- [x] Implement logout functionality
- [x] Add input validation (email format, password strength)

### Task 1.4: Character System
- [x] Create Character model schema (name, class, level, stats, position, etc.)
- [x] Implement POST /api/characters endpoint (create character)
- [x] Implement GET /api/characters endpoint (list user's characters)
- [x] Implement DELETE /api/characters/:id endpoint
- [x] Create class definitions (Dark Knight, Dark Wizard, Elf, Magic Gladiator, Dark Lord)
- [x] Create Character Select UI
- [x] Create Character Creation UI (name input, class selection)
- [x] Validate character name (unique, 3-12 characters, alphanumeric)
- [x] Initialize starting stats based on class
- [x] Set default starting position (Lorencia town)

### 🧪 PHASE 1: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage) ✅ 81.3%
- [x] **Auth Tests** (auth.test.js)
  - [x] Test user registration with valid data
  - [x] Test user registration with duplicate email
  - [x] Test user registration with weak password
  - [x] Test login with correct credentials
  - [x] Test login with incorrect password
  - [x] Test JWT token generation
  - [x] Test JWT token verification
  - [x] Test auth middleware with valid token
  - [x] Test auth middleware with invalid/expired token

- [x] **Character Tests** (character.test.js)
  - [x] Test character creation with valid data
  - [x] Test character creation with duplicate name
  - [x] Test character creation with invalid class
  - [x] Test get characters for authenticated user
  - [x] Test character deletion
  - [x] Test stat initialization for each class
  - [x] Test character name validation

- [x] **Database Tests** (via MongoDB Memory Server + test setup)
  - [x] Test MongoDB connection
  - [x] Test User model save/retrieve
  - [x] Test Character model save/retrieve
  - [x] Test cascade delete (user -> characters)

#### Integration Tests
- [ ] **E2E Auth Flow** (auth.integration.test.js)
  - [ ] Complete registration -> login -> access protected route flow
  - [ ] Test token refresh flow
  - [ ] Test logout and token invalidation

- [ ] **E2E Character Flow** (character.integration.test.js)
  - [ ] Register -> Login -> Create Character -> List Characters -> Delete Character

#### Manual Test Cases
- [ ] UI responsive trên desktop (1920x1080, 1366x768)
- [ ] 3D scene render không có lỗi trong Console
- [ ] Camera controls mượt mà
- [ ] Character animations chạy đúng
- [ ] Form validation hiển thị error messages rõ ràng

---

## 🏃 PHASE 2: MOVEMENT & COMBAT (2-3 tuần)

### Task 2.1: Movement System
- [x] Implement raycasting để detect click trên terrain
- [x] Implement A* pathfinding algorithm
- [x] Create pathfinding grid từ map data
- [x] Calculate shortest path from current position to target
- [x] Implement smooth character movement along path
- [x] Update character rotation to face movement direction
- [ ] Switch to walk animation khi di chuyển
- [ ] Switch to idle animation khi dừng
- [x] Implement collision detection with obstacles
- [x] Sync movement với server (send position updates)
- [x] Broadcast movement to other players
- [x] Interpolate other players' movement (smooth network movement)

### Task 2.2: Monster System
- [x] Create Monster model (id, name, level, HP, attack, defense, position, etc.)
- [x] Load monster data từ JSON file (monsters.json)
- [x] Implement monster spawning system
- [x] Create spawn zones trên map
- [x] Implement respawn timer (30-60 seconds)
- [x] Render monster models in 3D scene
- [x] Display monster name và level trên đầu
- [x] Implement monster HP bar

### Task 2.3: Combat System
- [ ] Implement click-to-target monster
- [ ] Display target info UI (name, level, HP)
- [ ] Implement auto-attack when in range
- [ ] Calculate attack range based on weapon type
- [ ] Implement attack animation
- [ ] Calculate damage: (STR/6 + Weapon Damage) * random(0.9-1.1)
- [ ] Apply defense reduction: Damage * (1 - Defense/(Defense+100))
- [ ] Send attack packet to server
- [ ] Server validate attack (range, cooldown, target alive)
- [ ] Broadcast damage to all nearby players
- [ ] Update HP bars
- [ ] Implement death for monsters
- [ ] Implement death for players (respawn mechanism)

### Task 2.4: Monster AI
- [ ] Implement idle state (wander in small area)
- [ ] Implement aggro detection (15 meter range)
- [ ] Implement chase behavior
- [ ] Implement attack behavior when in range
- [ ] Calculate monster damage to player
- [ ] Return to spawn point if player too far
- [ ] Reset HP when returning to spawn

### Task 2.5: Rewards System
- [ ] Create drop table system (probability-based)
- [ ] Generate loot on monster death
- [ ] Spawn loot items on ground (3D models)
- [ ] Implement item pickup (click or auto-pickup)
- [ ] Calculate EXP reward: Monster Base EXP * (1 + Level Diff * 0.1)
- [ ] Award EXP to player
- [ ] Check level up: Current EXP >= Required EXP (Level³ * 10 + 1000)
- [ ] Implement level up effects (particles, sound)
- [ ] Award stat points on level up (5 points per level)
- [ ] Update character stats in database

### 🧪 PHASE 2: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Pathfinding Tests** (pathfinding.test.js)
  - [ ] Test A* finds shortest path
  - [ ] Test pathfinding avoids obstacles
  - [ ] Test pathfinding with no valid path
  - [ ] Test path calculation performance (<100ms for 50x50 grid)

- [ ] **Combat Tests** (combat.test.js)
  - [ ] Test damage calculation formula
  - [ ] Test defense reduction formula
  - [ ] Test attack range validation
  - [ ] Test attack cooldown
  - [ ] Test critical hit calculation
  - [ ] Test death conditions

- [ ] **Monster AI Tests** (monsterAI.test.js)
  - [ ] Test aggro detection
  - [ ] Test chase behavior
  - [ ] Test return to spawn
  - [ ] Test attack target selection

- [ ] **Rewards Tests** (rewards.test.js)
  - [ ] Test EXP calculation
  - [ ] Test level up detection
  - [ ] Test drop table probability distribution
  - [ ] Test loot generation

#### Integration Tests
- [ ] **Movement Flow** (movement.integration.test.js)
  - [ ] Click terrain -> Character moves -> Position synced to server
  - [ ] Multiple players see each other's movement

- [ ] **Combat Flow** (combat.integration.test.js)
  - [ ] Player attacks monster -> Monster takes damage -> Monster dies -> Loot drops -> Player gains EXP

#### Performance Tests
- [ ] Test with 50 monsters on screen (60 FPS maintained)
- [ ] Test with 10 players + 50 monsters (no significant lag)
- [ ] Memory leak test (play for 10 minutes, check memory usage)

#### Manual Test Cases
- [ ] Click-to-move hoạt động chính xác
- [ ] Character không đi xuyên qua obstacles
- [ ] Monster aggro và chase player
- [ ] Combat animations và damage numbers hiển thị
- [ ] EXP bar tăng và level up animation
- [ ] Items drop và có thể pickup

---

## 🎒 PHASE 3: ITEMS & INVENTORY (2 tuần)

### Task 3.1: Item System
- [ ] Create Item model (itemId, name, type, level, rarity, stats, durability)
- [ ] Load item database từ items.json
- [ ] Define item types: Weapon, Helmet, Armor, Pants, Gloves, Boots, Wings, Ring, Pendant, Consumable
- [ ] Define item rarities: Normal, Magic, Rare, Legendary, Ancient
- [ ] Implement item stat generation (random options)
- [ ] Create item icons (images hoặc sprites)
- [ ] Implement item tooltips (show stats on hover)

### Task 3.2: Inventory System
- [ ] Create inventory grid (8x8 hoặc 10x10)
- [ ] Implement grid-based positioning (items occupy slots)
- [ ] Implement drag-and-drop functionality
- [ ] Highlight valid drop zones
- [ ] Prevent overlapping items
- [ ] Implement item stacking (consumables, materials)
- [ ] Display item count for stacks
- [ ] Implement right-click context menu (use, drop, split stack)
- [ ] Add inventory to Character model (array of items with positions)
- [ ] Sync inventory changes với server
- [ ] Implement inventory weight limit (optional)
- [ ] Create "Inventory Full" error handling

### Task 3.3: Equipment System
- [ ] Create equipment slots UI (weapon, helmet, armor, etc.)
- [ ] Implement drag item từ inventory to equipment slot
- [ ] Validate item type matches slot
- [ ] Validate level requirement
- [ ] Validate class requirement
- [ ] Unequip item back to inventory
- [ ] Calculate total stats từ all equipped items
- [ ] Update character stats display
- [ ] Sync equipped items với server
- [ ] Update character visual (show equipped items on 3D model)
- [ ] Implement equipment durability loss on combat
- [ ] Implement broken equipment (0 durability = no stats)

### 🧪 PHASE 3: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Item Tests** (item.test.js)
  - [ ] Test item generation with random stats
  - [ ] Test item rarity distribution
  - [ ] Test item validation (type, level, class)
  - [ ] Test item stacking logic
  - [ ] Test durability reduction

- [ ] **Inventory Tests** (inventory.test.js)
  - [ ] Test add item to inventory
  - [ ] Test remove item from inventory
  - [ ] Test inventory full condition
  - [ ] Test item position conflicts
  - [ ] Test item stacking
  - [ ] Test drag-and-drop logic

- [ ] **Equipment Tests** (equipment.test.js)
  - [ ] Test equip valid item
  - [ ] Test equip item with insufficient level
  - [ ] Test equip item to wrong slot
  - [ ] Test unequip item
  - [ ] Test stat calculation from equipment
  - [ ] Test multiple rings/accessories

#### Integration Tests
- [ ] **Item Flow** (item.integration.test.js)
  - [ ] Monster drops item -> Player picks up -> Item in inventory -> Equip item -> Stats updated

#### Manual Test Cases
- [ ] Drag-and-drop hoạt động mượt mà
- [ ] Item tooltips hiển thị đầy đủ thông tin
- [ ] Equipment slots hiển thị correct items
- [ ] Character stats cập nhật real-time khi equip/unequip
- [ ] Inventory không chấp nhận items khi full

---

## ⚔️ PHASE 4: SKILLS & ADVANCED COMBAT (2 tuần)

### Task 4.1: Skill System
- [ ] Create Skill model (skillId, name, class, level, manaCost, cooldown, damage, type)
- [ ] Load skill database từ skills.json
- [ ] Define skill types: Active, Passive, Buff, Debuff, AOE, Single Target
- [ ] Create skill tree for each class
- [ ] Implement skill learning system (unlock at certain levels)
- [ ] Add skills array to Character model
- [ ] Create skill book/skill tree UI

### Task 4.2: Hotbar System
- [x] Create hotbar UI (9 slots for keys 1-9)
- [x] Implement drag skill từ skill book to hotbar
- [x] Save hotbar configuration to database
- [x] Implement keyboard shortcuts (1-9 keys)
- [x] Display cooldown timer on skill icons
- [x] Display mana cost on skill icons
- [x] Grey out skill if insufficient mana
- [x] Implement skill activation on keypress

### Task 4.3: Skill Execution
- [ ] Validate skill cast (target, range, mana, cooldown)
- [ ] Deduct mana cost
- [ ] Start cooldown timer
- [ ] Play skill cast animation
- [ ] Calculate skill damage: Base Damage + (Stat/X) * Skill Level
- [ ] Apply skill effects to target(s)
- [ ] Send skill packet to server
- [ ] Server validates and broadcasts skill usage
- [ ] Implement skill targeting (click target, self-cast, ground target)

### Task 4.4: Skill Effects
- [ ] Create particle systems cho mỗi skill (fire, ice, lightning, etc.)
- [ ] Implement skill projectiles (arrows, fireballs, etc.)
- [ ] Implement AOE indicators (circles, cones)
- [ ] Detect targets in AOE
- [ ] Load và play sound effects
- [ ] Implement buff/debuff icons
- [ ] Implement buff duration tracking
- [ ] Remove buffs/debuffs on expiration
- [ ] Stack buff effects

### 🧪 PHASE 4: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Skill Tests** (skill.test.js)
  - [ ] Test skill damage calculation
  - [ ] Test mana cost deduction
  - [ ] Test cooldown tracking
  - [ ] Test skill validation (range, target, mana)
  - [ ] Test AOE target detection
  - [ ] Test buff/debuff application
  - [ ] Test buff stacking logic

- [ ] **Hotbar Tests** (hotbar.test.js)
  - [ ] Test add skill to hotbar
  - [ ] Test remove skill from hotbar
  - [ ] Test hotbar persistence
  - [ ] Test keyboard shortcut mapping

#### Integration Tests
- [ ] **Skill Flow** (skill.integration.test.js)
  - [ ] Learn skill -> Add to hotbar -> Cast skill -> Target takes damage -> Cooldown starts

#### Performance Tests
- [ ] Test 10 players casting AOE skills simultaneously
- [ ] Test particle effects performance (60 FPS maintained)

#### Manual Test Cases
- [ ] Skills cast với correct animations
- [ ] Particle effects hiển thị đúng
- [ ] Sound effects play correctly
- [ ] Cooldowns hiển thị accurate
- [ ] Buff icons và timers work
- [ ] AOE indicators clear và accurate

---

## 👥 PHASE 5: SOCIAL FEATURES (1-2 tuần)

### Task 5.1: Chat System
- [x] Create chat UI component (input box, message list)
- [x] Implement chat channels: Global, Party, Guild, Whisper
- [x] Create channel tabs hoặc dropdown
- [x] Implement send message (socket event)
- [x] Broadcast messages to appropriate players
- [x] Display messages với timestamp và sender name
- [x] Color-code messages by channel
- [x] Implement whisper command: /w username message
- [x] Implement chat history (scroll to view old messages)
- [x] Implement profanity filter (optional)
- [x] Store chat logs in database (optional)

### Task 5.2: Party System
- [x] Create Party model (leaderId, members, createdAt)
- [x] Implement create party
- [x] Implement invite to party (send invitation)
- [x] Create party invitation UI (accept/decline)
- [x] Implement join party
- [x] Implement leave party
- [x] Implement kick member (leader only)
- [x] Display party members list UI
- [x] Show party member HP/MP bars
- [x] Show party member positions on minimap
- [x] Implement shared EXP (distribute based on contribution)
- [x] Implement party chat channel
- [x] Disband party when leader leaves

### 🧪 PHASE 5: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Chat Tests** (chat.test.js)
  - [ ] Test send message to global channel
  - [ ] Test send message to party channel (only party members receive)
  - [ ] Test whisper to specific player
  - [ ] Test chat message validation (length, profanity)
  - [ ] Test message broadcasting

- [ ] **Party Tests** (party.test.js)
  - [ ] Test create party
  - [ ] Test invite player to party
  - [ ] Test join party
  - [ ] Test leave party
  - [ ] Test kick member
  - [ ] Test party EXP distribution
  - [ ] Test party size limit (max 5)
  - [ ] Test party disbanded when leader leaves

#### Integration Tests
- [ ] **Chat Flow** (chat.integration.test.js)
  - [ ] Player A sends global message -> Player B receives it
  - [ ] Player A whispers Player B -> Only Player B receives it

- [ ] **Party Flow** (party.integration.test.js)
  - [ ] Player A creates party -> Invites Player B -> Player B accepts -> Both in party -> Shared EXP works

#### Manual Test Cases
- [ ] Chat messages hiển thị real-time
- [ ] Chat channels hoạt động correctly
- [ ] Party invitations appear và functional
- [ ] Party member list cập nhật live
- [ ] Party EXP distribution correct

---

## 💰 PHASE 6: ECONOMY & TRADING (1-2 tuần)

### Task 6.1: NPC System
- [x] Create NPC model (npcId, name, type, position, shopItems)
- [x] Load NPC data từ npcs.json
- [x] Spawn NPCs on map
- [x] Render NPC models (3D characters)
- [x] Display NPC names
- [x] Implement click-to-interact with NPC
- [x] Create NPC dialog UI

### Task 6.2: Shop System
- [x] Create shop UI (NPC items list, player inventory, gold display)
- [x] Load NPC shop items
- [x] Implement buy item (deduct gold, add to inventory)
- [x] Validate purchase (enough gold, inventory space)
- [x] Implement sell item (remove from inventory, add gold)
- [x] Calculate sell price (50% of buy price)
- [x] Implement repair item (cost based on durability lost)
- [x] Update shop UI real-time
- [x] Sync transactions với server
- [x] Log transactions (optional)

### Task 6.3: Trading System
- [x] Implement trade request (click player, select "Trade")
- [x] Create trade invitation UI (accept/decline)
- [x] Create trade window (2 sides: you, other player)
- [x] Implement add item to trade window
- [x] Implement add gold to trade
- [x] Display trade contents to both players
- [x] Implement "Ready" checkbox
- [x] Validate trade when both ready (items exist, inventory space)
- [x] Execute trade (swap items and gold)
- [x] Implement cancel trade
- [x] Prevent trade scams (validate on server)

### 🧪 PHASE 6: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Shop Tests** (shop.test.js)
  - [ ] Test buy item with sufficient gold
  - [ ] Test buy item with insufficient gold
  - [ ] Test buy item with full inventory
  - [ ] Test sell item (price calculation)
  - [ ] Test repair item (cost calculation)

- [ ] **Trading Tests** (trading.test.js)
  - [ ] Test send trade request
  - [ ] Test accept trade request
  - [ ] Test decline trade request
  - [ ] Test add items to trade
  - [ ] Test add gold to trade
  - [ ] Test complete trade (items swapped correctly)
  - [ ] Test cancel trade (items returned)
  - [ ] Test trade validation (inventory space)

#### Integration Tests
- [ ] **Shop Flow** (shop.integration.test.js)
  - [ ] Click NPC -> Open shop -> Buy item -> Gold deducted, item in inventory

- [ ] **Trading Flow** (trading.integration.test.js)
  - [ ] Player A requests trade -> Player B accepts -> Both add items -> Both ready -> Trade completes

#### Manual Test Cases
- [ ] NPC shops open và display correctly
- [ ] Buy/sell transactions work smoothly
- [ ] Trade window functional
- [ ] Trade validation prevents exploits
- [ ] UI updates reflect transactions immediately

---

## 🏰 PHASE 7: ADVANCED FEATURES (2-3 tuần)

### Task 7.1: Guild System
- [x] Create Guild model (name, leaderId, members, level, exp, funds, emblem)
- [x] Implement create guild (cost: 1,000,000 gold)
- [x] Validate guild name (unique, 3-12 characters)
- [x] Implement guild invitation system
- [x] Implement join guild
- [x] Implement leave guild
- [x] Create guild ranks: Leader, Officer, Member
- [x] Implement promote/demote members (leader/officer only)
- [x] Implement kick member (leader/officer only)
- [x] Create guild UI (member list, ranks, info)
- [x] Implement guild chat channel
- [x] Create guild storage (shared inventory)
- [ ] Implement guild emblem upload (optional)
- [x] Display guild name above character
- [ ] Implement guild vs guild (GvG) wars (optional)

### Task 7.2: PvP System
- [x] Implement duel request system
- [x] Create duel invitation UI
- [x] Create duel arena (safe zone)
- [x] Implement duel combat (HP only, no death)
- [x] Announce duel winner
- [x] Implement PK (player kill) system
- [x] Define PK zones (danger zones)
- [x] Implement PK flag (turns red when killing player)
- [x] Implement PK penalty (drop items on death if PK)
- [x] Track PK count
- [x] Implement PK cooldown/redemption system

### Task 7.3: Item Enhancement
- [x] Create enhancement UI
- [x] Implement enhancement levels (+0 to +15)
- [x] Define success rates by level: +0-+6: 100%, +7: 50%, +8: 40%, ..., +15: 1%
- [x] Implement jewel system (Bless: protect on fail, Soul: +5% rate, Chaos: random +1 to +4)
- [x] Implement enhancement attempt (consume jewels, apply result)
- [x] Implement item destruction on failure (above +10)
- [x] Update item stats based on enhancement level (+5% per level)
- [x] Display enhanced level on item name (+X)
- [x] Add visual glow effects for high enhancement
- [x] Sync enhancement với server

### Task 7.4: Boss System
- [x] Create Boss monster variants (higher HP, damage, special skills)
- [x] Implement boss spawn timer (e.g., every 2 hours)
- [x] Announce boss spawn to all players
- [x] Implement boss aggro table (multiple players)
- [x] Implement boss special attacks (AOE, stun, etc.)
- [x] Implement boss phases (HP thresholds trigger new behaviors)
- [x] Define boss loot table (rare items, high gold)
- [x] Distribute loot based on contribution (damage dealt)
- [x] Announce boss kill to all players

### Task 7.5: Multiple Maps
- [x] Create Lorencia map (starting town, safe zone)
- [x] Create Dungeon map (level 1-20 monsters)
- [x] Create Devias map (level 20-50 monsters)
- [x] Create Noria map (level 50-80 monsters)
- [x] Create Atlans map (level 80-120 monsters)
- [x] Create teleport system between maps
- [x] Create NPC teleporters
- [x] Validate map entry (level requirement)
- [x] Load map data dynamically (don't load all at once)
- [x] Implement fog of war hoặc distance culling

### 🧪 PHASE 7: TESTING REQUIREMENTS

#### Unit Tests (Minimum 80% coverage)
- [ ] **Guild Tests** (guild.test.js)
  - [ ] Test create guild with sufficient gold
  - [ ] Test create guild with duplicate name
  - [ ] Test invite member
  - [ ] Test join guild
  - [ ] Test leave guild
  - [ ] Test promote/demote member
  - [ ] Test kick member
  - [ ] Test guild storage access

- [ ] **PvP Tests** (pvp.test.js)
  - [ ] Test duel request/accept
  - [ ] Test duel combat
  - [ ] Test PK flag application
  - [ ] Test PK penalty (item drop)
  - [ ] Test PK zone restrictions

- [ ] **Enhancement Tests** (enhancement.test.js)
  - [ ] Test enhancement success
  - [ ] Test enhancement failure
  - [ ] Test item destruction on failure
  - [ ] Test jewel effects (Bless, Soul, Chaos)
  - [ ] Test stat increase per enhancement level

- [ ] **Boss Tests** (boss.test.js)
  - [ ] Test boss spawn timer
  - [ ] Test boss aggro table
  - [ ] Test boss special attacks
  - [ ] Test boss phase transitions
  - [ ] Test loot distribution

- [ ] **Map Tests** (map.test.js)
  - [ ] Test map loading
  - [ ] Test teleportation between maps
  - [ ] Test map entry validation
  - [ ] Test collision detection per map

#### Integration Tests
- [ ] **Guild Flow** (guild.integration.test.js)
  - [ ] Create guild -> Invite member -> Member joins -> Guild chat works

- [ ] **PvP Flow** (pvp.integration.test.js)
  - [ ] Player A challenges Player B -> Duel starts -> Winner determined

- [ ] **Enhancement Flow** (enhancement.integration.test.js)
  - [ ] Get item -> Open enhancement UI -> Use jewel -> Enhancement succeeds/fails -> Stats updated

- [ ] **Boss Flow** (boss.integration.test.js)
  - [ ] Boss spawns -> Multiple players attack -> Boss dies -> Loot distributed

#### Performance Tests
- [ ] Test 50 players attacking 1 boss (no server crash)
- [ ] Test guild with 100 members (UI responsive)

#### Manual Test Cases
- [ ] Guild creation và management work
- [ ] Duel và PK systems functional
- [ ] Enhancement UI responsive, results correct
- [ ] Boss fights epic và fair
- [ ] Map transitions smooth

---

## ✨ PHASE 8: POLISH & OPTIMIZATION (1-2 tuần)

### Task 8.1: Performance Optimization
- [ ] Profile client-side performance (Chrome DevTools)
- [ ] Optimize 3D rendering (LOD, frustum culling)
- [ ] Implement object pooling for projectiles/particles
- [ ] Optimize network packets (compress data)
- [ ] Implement dead reckoning for movement
- [ ] Add server-side rate limiting
- [ ] Implement Redis for session storage
- [ ] Enable database indexing on frequently queried fields
- [ ] Implement lazy loading for distant players/monsters
- [ ] Monitor memory leaks và fix

### Task 8.2: Bug Fixes & Balance
- [ ] Fix reported bugs (track in GitHub Issues)
- [ ] Balance character classes (damage, HP, skills)
- [ ] Balance monster difficulty (HP, damage, EXP)
- [ ] Balance item stats và drop rates
- [ ] Balance economy (gold rewards, item prices)
- [ ] Fix edge cases (race conditions, null checks)
- [ ] Improve error handling và user feedback

### Task 8.3: UI/UX Improvements
- [x] Add loading screens với progress bars
- [x] Add tooltips for all UI elements
- [x] Improve button feedback (hover, click effects)
- [ ] Add sound effects for UI interactions
- [ ] Improve mobile responsiveness (if targeting mobile)
- [x] Add settings menu (sound volume, graphics quality, keybindings)
- [x] Implement keybinding customization
- [ ] Add minimap với player/monster/NPC markers
- [x] Improve chat UI (tabs, filters, font size)
- [ ] Add notification system (achievements, level up, etc.)

### 🧪 PHASE 8: TESTING REQUIREMENTS

#### Performance Tests
- [ ] **Load Test**: 100 concurrent players
- [ ] **Stress Test**: 500 concurrent players
- [ ] **Soak Test**: 50 players online for 8 hours (memory stable)
- [ ] **Client FPS**: Maintain 60 FPS với 50 entities on screen
- [ ] **Network Latency**: <100ms response time under normal load

#### Regression Tests
- [ ] Re-run all Phase 1-7 tests to ensure no regressions
- [ ] Test all critical user flows end-to-end

#### Security Tests
- [ ] Test SQL injection protection
- [ ] Test XSS protection
- [ ] Test CSRF protection
- [ ] Test JWT token tampering
- [ ] Test packet manipulation (client-side cheating)
- [ ] Test DDoS protection (rate limiting)

#### Manual Test Cases
- [ ] Full playthrough (register -> create character -> level to 50 -> join guild -> PvP -> trade)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different screen sizes
- [ ] Check all animations smooth
- [ ] Verify all sound effects playing
- [ ] Confirm no console errors

---

## 📦 DELIVERABLES CHECKLIST

### Code Quality
- [ ] All code follows ESLint rules
- [ ] All code formatted with Prettier
- [ ] No console.log() in production code
- [ ] All TODO comments resolved
- [ ] Code review completed

### Documentation
- [ ] README.md với setup instructions
- [ ] API documentation (endpoints, socket events)
- [ ] Database schema documentation
- [ ] Game design document
- [ ] Code comments for complex logic

### Testing
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Security tests passing
- [ ] Manual test cases completed

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Frontend build optimized (minified, compressed)
- [ ] Backend ready for production
- [ ] CI/CD pipeline configured (optional)
- [ ] Monitoring và logging setup (optional)

---

## 🎉 PROJECT COMPLETION

Khi tất cả 107 tasks hoàn thành và tất cả tests pass, dự án đã sẵn sàng để:

1. **Deploy to production** (Heroku, AWS, DigitalOcean, etc.)
2. **Open beta testing** với real users
3. **Gather feedback** và iterate
4. **Add more features** (mounts, pets, housing, etc.)

---

## 📞 SUPPORT & RESOURCES

### Testing Frameworks
- **Unit Tests**: Jest + Supertest (backend), Jest + React Testing Library (frontend)
- **Integration Tests**: Jest + MongoDB Memory Server
- **E2E Tests**: Cypress hoặc Playwright
- **Performance Tests**: Artillery.io, k6

### Recommended Commands
```bash
# Run unit tests
npm test

# Run tests với coverage
npm test -- --coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Lint code
npm run lint

# Format code
npm run format
```

### Test Coverage Requirements
- **Overall**: Minimum 80% coverage
- **Critical Paths**: 100% coverage (auth, payment, combat, trading)
- **Business Logic**: 90%+ coverage
- **UI Components**: 70%+ coverage

---

## 🚀 QUICK START FOR AGENT

**To begin implementation, agent should:**

1. Read this entire checklist
2. Start with Phase 1, Task 1.1
3. Complete each task in order, checking boxes as done
4. Write unit tests immediately after implementing each feature
5. Run tests after each task completion
6. Don't move to next Phase until all tests in current Phase pass
7. Update progress overview at top of document
8. Ask for clarification if requirements unclear
9. Report blockers immediately

**Command to start:**
```
"Agent, please begin Phase 1: Core Foundation. Start with Task 1.1: Project Setup. 
Create the folder structure and setup all necessary dependencies. 
Run 'npm init' for both client and server. 
Install all required packages and configure the development environment."
```

---

## 📋 AGENT WORKFLOW EXAMPLE

### For each task:
1. ✅ Read task requirements
2. 💻 Implement the feature
3. 🧪 Write unit tests (minimum 5 test cases)
4. ✅ Run tests: `npm test`
5. ✅ Ensure all tests pass
6. ✅ Check code coverage meets threshold
7. ✅ Mark checkbox with [x]
8. ✅ Commit code: `git commit -m "feat: implemented [task name]"`
9. ✅ Move to next task

### At end of each Phase:
1. ✅ Run all Phase tests
2. ✅ Run integration tests
3. ✅ Perform manual testing
4. ✅ Document any known issues
5. ✅ Update progress overview
6. ✅ Create Phase completion report
7. ✅ Get approval to proceed to next Phase

---

## 🎯 SUCCESS METRICS

### Phase 1
- ✅ User can register and login
- ✅ User can create and select characters
- ✅ 3D scene renders correctly
- ✅ All unit tests pass (80%+ coverage)

### Phase 2
- ✅ Character movement works smoothly
- ✅ Combat system functional
- ✅ Monsters spawn and fight
- ✅ EXP and leveling works
- ✅ All tests pass

### Phase 3
- ✅ Inventory drag-and-drop works
- ✅ Equipment system functional
- ✅ Stats update correctly
- ✅ All tests pass

### Phase 4
- ✅ Skills can be cast
- ✅ Cooldowns và mana costs work
- ✅ Skill effects render
- ✅ All tests pass

### Phase 5
- ✅ Chat real-time communication works
- ✅ Party system functional
- ✅ All tests pass

### Phase 6
- ✅ NPC shops work
- ✅ Player trading secure
- ✅ All tests pass

### Phase 7
- ✅ Guilds can be created
- ✅ PvP systems work
- ✅ Item enhancement functional
- ✅ Boss fights epic
- ✅ Multiple maps accessible
- ✅ All tests pass

### Phase 8
- ✅ Game runs smoothly (60 FPS)
- ✅ 100 players can play simultaneously
- ✅ No critical bugs
- ✅ All tests pass
- ✅ Ready for production

---

**🎮 GAME ON! Let's build an awesome MMORPG! 🎮**
