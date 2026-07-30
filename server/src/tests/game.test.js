const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const World = require('../game/World');
const SpawnSystem = require('../game/systems/SpawnSystem');
const CombatSystem = require('../game/systems/CombatSystem');
const MovementSystem = require('../game/systems/MovementSystem');
const DropSystem = require('../game/systems/DropSystem');
const MonsterAI = require('../game/systems/MonsterAI');

describe('SpawnSystem', () => {
  let mockWorld;
  let spawnSystem;

  beforeEach(() => {
    mockWorld = { getNearbyPlayers: () => [] };
    spawnSystem = new SpawnSystem(mockWorld);
  });

  it('should spawn a monster with correct properties', () => {
    const template = {
      monsterId: 'plant',
      name: 'Plant',
      level: 3,
      hp: 50,
      attack: 5,
      defense: 3,
      expReward: 20,
      goldReward: { min: 5, max: 15 },
      dropTable: [],
      mapId: 'lorencia',
      speed: 2,
      attackSpeed: 1000,
      attackRange: 2,
      aggroRange: 15,
      isBoss: false,
    };
    const monster = spawnSystem.spawnMonster(template, 'lorencia');
    expect(monster).toBeDefined();
    expect(monster.currentHP).toBe(50);
    expect(monster.position.mapId).toBe('lorencia');
    expect(monster.instanceId).toBeDefined();
    expect(monster.state).toBe('idle');
  });

  it('should despawn a monster', () => {
    const template = {
      monsterId: 'plant',
      name: 'Plant',
      level: 3,
      hp: 50,
      attack: 5,
      defense: 3,
      expReward: 20,
      goldReward: { min: 5, max: 15 },
      dropTable: [],
      mapId: 'lorencia',
      speed: 2,
      attackSpeed: 1000,
      attackRange: 2,
      aggroRange: 15,
      isBoss: false,
    };
    const monster = spawnSystem.spawnMonster(template, 'lorencia');
    const despawned = spawnSystem.despawnMonster(monster.instanceId);
    expect(despawned).toBe(monster);
    expect(spawnSystem.getByInstanceId(monster.instanceId)).toBeNull();
  });

  it('should find nearby monsters', () => {
    const template = {
      monsterId: 'skeleton',
      name: 'Skeleton',
      level: 5,
      hp: 80,
      attack: 8,
      defense: 5,
      expReward: 30,
      goldReward: { min: 10, max: 20 },
      dropTable: [],
      mapId: 'dungeon',
      speed: 2,
      attackSpeed: 1000,
      attackRange: 2,
      aggroRange: 15,
      isBoss: false,
    };
    const m = spawnSystem.spawnMonster(template, 'dungeon');
    const nearby = spawnSystem.getNearbyMonsters(m.position.x, m.position.z, 'dungeon', 50);
    expect(nearby).toContain(m);
  });
});

describe('MovementSystem', () => {
  let mockWorld;
  let movementSystem;

  beforeEach(() => {
    mockWorld = {};
    movementSystem = new MovementSystem(mockWorld);
  });

  it('should move player within bounds', () => {
    const player = {
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
    };
    const result = movementSystem.movePlayer(player, 130, 0, 130);
    expect(result.success).toBe(true);
    expect(player.position.x).toBe(130);
    expect(player.position.z).toBe(130);
  });

  it('should reject movement outside bounds', () => {
    const player = {
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
    };
    const result = movementSystem.movePlayer(player, 300, 0, 300);
    expect(result.success).toBe(false);
  });

  it('should teleport player to new map', () => {
    const player = {
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
    };
    const result = movementSystem.teleportPlayer(player, 'dungeon', 128, 128);
    expect(result).toBe(true);
    expect(player.position.mapId).toBe('dungeon');
  });

  it('should calculate distance correctly', () => {
    const pos1 = { x: 0, z: 0 };
    const pos2 = { x: 3, z: 4 };
    const inRange = movementSystem.isInRange(pos1, pos2, 5);
    expect(inRange).toBe(true);
  });

  it('should find path using A*', () => {
    const path = movementSystem.astar(0, 0, 3, 3, null);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0].x).toBe(0);
    expect(path[0].z).toBe(0);
  });
});

describe('DropSystem', () => {
  let dropSystem;

  beforeEach(() => {
    dropSystem = new DropSystem({});
  });

  it('should generate gold drops', () => {
    const monster = {
      level: 5,
      goldReward: { min: 10, max: 20 },
      dropTable: [],
      expReward: 30,
    };
    const drops = dropSystem.generateDrop(monster);
    const goldDrop = drops.find((d) => d.type === 'gold');
    expect(goldDrop).toBeDefined();
    expect(goldDrop.amount).toBeGreaterThanOrEqual(10);
    expect(goldDrop.amount).toBeLessThanOrEqual(20);
  });

  it('should calculate EXP based on level difference', () => {
    const monster = { level: 10, expReward: 100 };
    const player = { level: 5 };
    const exp = dropSystem.calculateExp(monster, player);
    expect(exp).toBeGreaterThan(100);

    const player2 = { level: 15 };
    const exp2 = dropSystem.calculateExp(monster, player2);
    expect(exp2).toBeLessThanOrEqual(100);
  });

  it('should generate items with rarity', () => {
    const monster = {
      level: 5,
      goldReward: { min: 5, max: 10 },
      dropTable: [{ itemId: 'dagger', chance: 1 }],
      expReward: 20,
    };
    const drops = dropSystem.generateDrop(monster);
    const itemDrop = drops.find((d) => d.type === 'item');
    expect(itemDrop).toBeDefined();
    expect(itemDrop.item.rarity).toBeDefined();
  });
});

describe('CombatSystem', () => {
  let mockWorld;
  let combatSystem;

  beforeEach(() => {
    mockWorld = {
      spawnSystem: {
        getByInstanceId: jest.fn(),
        getNearbyMonsters: jest.fn(),
      },
    };
    combatSystem = new CombatSystem(mockWorld);
  });

  it('should return error when target not found', () => {
    mockWorld.spawnSystem.getByInstanceId.mockReturnValue(null);
    const result = combatSystem.playerAttack(
      { position: { mapId: 'lorencia' } },
      'nonexistent'
    );
    expect(result.success).toBe(false);
  });

  it('should calculate damage with strength and weapon', () => {
    const monster = {
      instanceId: 'test',
      currentHP: 100,
      hp: 100,
      defense: 5,
      position: { mapId: 'lorencia', x: 130, z: 130 },
    };
    mockWorld.spawnSystem.getByInstanceId.mockReturnValue(monster);

    const player = {
      stats: { strength: 20, agility: 10 },
      position: { mapId: 'lorencia', x: 130, y: 0, z: 131 },
      equipment: { weapon: { stats: { damage: 10 } } },
    };

    const result = combatSystem.playerAttack(player, 'test');
    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });

  it('should handle critical hits', () => {
    const monster = {
      instanceId: 'test',
      currentHP: 100,
      hp: 100,
      defense: 5,
      position: { mapId: 'lorencia', x: 130, z: 130 },
    };
    mockWorld.spawnSystem.getByInstanceId.mockReturnValue(monster);

    const player = {
      stats: { strength: 100, agility: 301 },
      position: { mapId: 'lorencia', x: 130, y: 0, z: 131 },
      equipment: { weapon: { stats: { damage: 20 } } },
    };

    let critCount = 0;
    for (let i = 0; i < 50; i++) {
      monster.currentHP = 100;
      const result = combatSystem.playerAttack(player, 'test');
      if (result.isCrit) critCount++;
    }
    expect(critCount).toBeGreaterThan(0);
  });

  it('should handle monster attack on player', () => {
    const monster = { attack: 10, lastAttack: 0, attackSpeed: 1000 };
    const player = {
      stats: { vitality: 10 },
      currentHP: 100,
      maxHP: 100,
    };

    const result = combatSystem.monsterAttack(monster, player);
    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(player.currentHP).toBeLessThan(100);
  });

  it('should respect monster attack cooldown', () => {
    const monster = { attack: 10, lastAttack: Date.now(), attackSpeed: 1000 };
    const player = { stats: { vitality: 10 }, currentHP: 100, maxHP: 100 };
    const result = combatSystem.monsterAttack(monster, player);
    expect(result.success).toBe(false);
  });
});

describe('MonsterAI', () => {
  let mockWorld;
  let monsterAI;

  beforeEach(() => {
    mockWorld = {
      getNearbyPlayers: jest.fn(() => []),
    };
    monsterAI = new MonsterAI(mockWorld);
  });

  it('should handle idle state', () => {
    const monster = {
      state: 'idle',
      spawnPoint: { x: 100, y: 0, z: 100 },
      position: { x: 100, y: 0, z: 100 },
      currentHP: 50,
    };
    monsterAI.updateMonster(monster, 0.1);
    expect(['idle', 'patrol']).toContain(monster.state);
  });

  it('should not update dead monsters', () => {
    const monster = { state: 'idle', currentHP: 0 };
    monsterAI.updateMonster(monster, 0.1);
    expect(monster.state).toBe('idle');
  });

  it('should not update stunned monsters', () => {
    const monster = { state: 'stunned', currentHP: 50 };
    monsterAI.updateMonster(monster, 0.1);
    expect(monster.state).toBe('stunned');
  });
});

describe('World', () => {
  it('should initialize with systems', () => {
    const world = new World();
    expect(world.spawnSystem).toBeDefined();
    expect(world.combatSystem).toBeDefined();
    expect(world.movementSystem).toBeDefined();
    expect(world.dropSystem).toBeDefined();
    expect(world.monsterAI).toBeDefined();
    expect(world.npcSystem).toBeDefined();
  });

  it('should spawn monsters on maps', () => {
    const world = new World();
    const lorenciaMonsters = world.spawnSystem.getAllOnMap('lorencia');
    expect(lorenciaMonsters.length).toBeGreaterThan(0);
  });

  it('should manage players', () => {
    const world = new World();
    const player = {
      _id: 'test-player',
      name: 'Tester',
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
      className: 'Dark Knight',
    };
    world.addPlayer(player);
    const found = world.getPlayer('test-player');
    expect(found).toBe(player);
    world.removePlayer('test-player');
    const gone = world.getPlayer('test-player');
    expect(gone).toBeNull();
  });

  it('should find nearby NPCs', () => {
    const world = new World();
    const npcs = world.getNearbyNPCs(130, 130, 'lorencia', 10);
    expect(npcs.length).toBeGreaterThan(0);
  });

  it('should drop and pick up items', () => {
    const world = new World();
    const item = { itemId: 'dagger', name: 'Dagger', stats: { damage: 5 } };
    const position = { x: 128, y: 0, z: 128, mapId: 'lorencia' };
    const instanceId = world.dropItemOnGround(item, position);
    expect(instanceId).toBeDefined();

    const player = {
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
      inventory: [],
    };
    const picked = world.pickupItem(instanceId, player);
    expect(picked).toBeDefined();
    expect(player.inventory.length).toBe(1);
  });

  it('should reject pickup when inventory full', () => {
    const world = new World();
    const item = { itemId: 'dagger', name: 'Dagger', stats: { damage: 5 } };
    const position = { x: 128, y: 0, z: 128, mapId: 'lorencia' };
    const instanceId = world.dropItemOnGround(item, position);

    const fullInventory = Array(64).fill(null);
    const player = {
      position: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
      inventory: fullInventory,
    };
    const picked = world.pickupItem(instanceId, player);
    expect(picked).toBeNull();
  });
});