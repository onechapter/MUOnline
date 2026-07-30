const SpawnSystem = require('./systems/SpawnSystem');
const CombatSystem = require('./systems/CombatSystem');
const MovementSystem = require('./systems/MovementSystem');
const DropSystem = require('./systems/DropSystem');
const MonsterAI = require('./systems/MonsterAI');
const NPCSystem = require('./systems/NPCSystem');
const PartySystem = require('./systems/PartySystem');
const GuildSystem = require('./systems/GuildSystem');
const EnhancementSystem = require('./systems/EnhancementSystem');
const TradingSystem = require('./systems/TradingSystem');
const PvPSystem = require('./systems/PvPSystem');
const BossSystem = require('./systems/BossSystem');

class World {
  constructor() {
    this.players = new Map();
    this.npcs = new Map();
    this.itemsOnGround = new Map();

    this.spawnSystem = new SpawnSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.movementSystem = new MovementSystem(this);
    this.dropSystem = new DropSystem(this);
    this.monsterAI = new MonsterAI(this);
    this.npcSystem = new NPCSystem(this);
    this.partySystem = new PartySystem(this);
    this.guildSystem = new GuildSystem();
    this.enhancementSystem = new EnhancementSystem();
    this.tradingSystem = TradingSystem;
    this.pvpSystem = PvPSystem;
    this.bossSystem = BossSystem;

    this.grids = {};
    this.initMapGrids();
    this.initNPCs();
  }

  initMapGrids() {
    const maps = ['lorencia', 'dungeon', 'devias', 'noria', 'atlans'];
    for (const map of maps) {
      this.spawnSystem.spawnMapMonsters(map);
    }
  }

  initNPCs() {
    const npcTemplates = [
      {
        npcId: 'shop-lorencia',
        name: 'Shopkeeper',
        type: 'shop',
        position: { x: 130, y: 0, z: 130, mapId: 'lorencia' },
        shopItems: [
          { itemId: 'dagger', price: 100 },
          { itemId: 'jewel-bless', price: 10000 },
          { itemId: 'jewel-soul', price: 20000 },
          { itemId: 'jewel-chaos', price: 50000 },
        ],
      },
      {
        npcId: 'teleport-lorencia',
        name: 'Teleporter',
        type: 'teleport',
        position: { x: 126, y: 0, z: 126, mapId: 'lorencia' },
      },
    ];

    for (const npc of npcTemplates) {
      this.npcs.set(npc.npcId, npc);
    }
  }

  addPlayer(player) {
    this.players.set(player._id?.toString() || player.id, player);
  }

  removePlayer(id) {
    this.players.delete(id);
  }

  getPlayer(id) {
    return this.players.get(id) || null;
  }

  getNearbyPlayers(x, z, mapId, range = 30) {
    return Array.from(this.players.values())
      .filter((p) => {
        if (p.position?.mapId !== mapId) return false;
        const dx = p.position.x - x;
        const dz = p.position.z - z;
        return Math.sqrt(dx * dx + dz * dz) <= range;
      });
  }

  getNearbyNPCs(x, z, mapId, range = 10) {
    return Array.from(this.npcs.values()).filter((npc) => {
      if (npc.position.mapId !== mapId) return false;
      const dx = npc.position.x - x;
      const dz = npc.position.z - z;
      return Math.sqrt(dx * dx + dz * dz) <= range;
    });
  }

  getNearbyItems(x, z, mapId, range = 5) {
    return Array.from(this.itemsOnGround.values()).filter((item) => {
      if (item.position.mapId !== mapId) return false;
      const dx = item.position.x - x;
      const dz = item.position.z - z;
      return Math.sqrt(dx * dx + dz * dz) <= range;
    });
  }

  dropItemOnGround(item, position) {
    const id = `${item.itemId}_${Date.now()}`;
    this.itemsOnGround.set(id, {
      ...item,
      instanceId: id,
      position: { ...position },
      droppedAt: Date.now(),
    });
    return id;
  }

  pickupItem(instanceId, player) {
    const groundItem = this.itemsOnGround.get(instanceId);
    if (!groundItem) return null;

    const dist = this.movementSystem.isInRange(
      player.position,
      groundItem.position,
      3
    );
    if (!dist) return null;

    if (player.inventory.length >= 64) return null;

    this.itemsOnGround.delete(instanceId);
    player.inventory.push(groundItem);
    return groundItem;
  }

  processMonsterDeath(monster, player) {
    const exp = this.dropSystem.calculateExp(monster, player);
    const drops = this.dropSystem.generateDrop(monster);

    for (const drop of drops) {
      if (drop.type === 'gold') {
        player.gold += drop.amount;
      } else if (drop.type === 'item') {
        this.dropItemOnGround(drop.item, monster.position);
      }
    }

    this.spawnSystem.despawnMonster(monster.instanceId);

    player.experience += exp;
    const required = player.level * player.level * player.level * 10 + 1000;

    let leveledUp = false;
    while (player.experience >= required) {
      player.level++;
      player.stats.points += 5;
      player.experience -= required;
      player.maxHP = 100 + player.stats.vitality * 2;
      player.maxMP = 50 + player.stats.energy * 2;
      player.currentHP = player.maxHP;
      player.currentMP = player.maxMP;
      leveledUp = true;
    }

    return { exp, drops, leveledUp };
  }

  tick(dt) {
    for (const monster of this.spawnSystem.monsters.values()) {
      if (monster.currentHP <= 0) continue;
      this.monsterAI.updateMonster(monster, dt);
    }

    for (const [id, item] of this.itemsOnGround) {
      if (Date.now() - item.droppedAt > 600000) {
        this.itemsOnGround.delete(id);
      }
    }
  }
}

module.exports = World;