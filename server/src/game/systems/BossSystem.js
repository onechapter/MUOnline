const bossSchedules = new Map();
const activeBosses = new Map();

class BossSystem {
  constructor() {
    this.bossTemplates = [
      {
        bossId: 'dragon',
        name: 'Dark Dragon',
        level: 50,
        hp: 50000,
        attack: 200,
        defense: 100,
        mapId: 'atlans',
        spawnX: 128,
        spawnZ: 128,
        spawnInterval: 7200000,
        specialAttacks: ['fire_breath', 'tail_swipe'],
        lootTable: [
          { itemId: 'legendary_sword', chance: 0.05 },
          { itemId: 'legendary_armor', chance: 0.05 },
          { itemId: 'epic_wings', chance: 0.1 },
          { gold: { min: 500000, max: 1000000 }, chance: 1 },
        ],
      },
      {
        bossId: 'demon',
        name: 'Demon King',
        level: 40,
        hp: 30000,
        attack: 150,
        defense: 80,
        mapId: 'noria',
        spawnX: 128,
        spawnZ: 128,
        spawnInterval: 5400000,
        specialAttacks: ['dark_storm', 'summon_minions'],
        lootTable: [
          { itemId: 'epic_sword', chance: 0.1 },
          { itemId: 'epic_armor', chance: 0.1 },
          { gold: { min: 300000, max: 500000 }, chance: 1 },
        ],
      },
      {
        bossId: 'ice_giant',
        name: 'Ice Giant',
        level: 30,
        hp: 20000,
        attack: 100,
        defense: 60,
        mapId: 'devias',
        spawnX: 128,
        spawnZ: 128,
        spawnInterval: 3600000,
        specialAttacks: ['ice_blast', 'frost_nova'],
        lootTable: [
          { itemId: 'rare_sword', chance: 0.2 },
          { itemId: 'rare_armor', chance: 0.2 },
          { gold: { min: 150000, max: 300000 }, chance: 1 },
        ],
      },
    ];
  }

  scheduleBoss(bossId, world) {
    const template = this.bossTemplates.find((b) => b.bossId === bossId);
    if (!template) return { success: false, error: 'Boss not found' };
    if (bossSchedules.has(bossId)) return { success: false, error: 'Already scheduled' };

    const interval = setInterval(() => {
      this.spawnBoss(bossId, world);
    }, template.spawnInterval);
    interval.unref();
    bossSchedules.set(bossId, interval);

    this.spawnBoss(bossId, world);
    return { success: true, template };
  }

  spawnBoss(bossId, world) {
    const template = this.bossTemplates.find((b) => b.bossId === bossId);
    if (!template || activeBosses.has(bossId)) return null;

    const boss = {
      instanceId: `boss_${bossId}_${Date.now()}`,
      ...template,
      currentHP: template.hp,
      maxHP: template.hp,
      state: 'idle',
      targetPlayer: null,
      position: { x: template.spawnX, y: 0, z: template.spawnZ, mapId: template.mapId },
      damageDealt: new Map(),
      phase: 1,
    };

    activeBosses.set(bossId, boss);
    world.spawnSystem.monsters.set(boss.instanceId, boss);
    world.dropItemOnGround({ itemId: boss.instanceId, name: boss.name, type: 'boss' }, boss.position);

    return boss;
  }

  specialAttack(boss, world) {
    const attack = boss.specialAttacks[Math.floor(Math.random() * boss.specialAttacks.length)];
    const players = world.getNearbyPlayers(boss.position.x, boss.position.z, boss.position.mapId, 20);
    const hits = [];

    for (const player of players) {
      const damage = this.calculateSpecialDamage(boss, player, attack);
      player.currentHP = Math.max(0, player.currentHP - damage);
      hits.push({ playerId: player._id?.toString() || player.id, damage, attack });
    }

    return { attack, hits };
  }

  calculateSpecialDamage(boss, player, attack) {
    switch (attack) {
      case 'fire_breath':
        return Math.floor(boss.attack * 1.5 * (0.9 + Math.random() * 0.2));
      case 'tail_swipe':
        return Math.floor(boss.attack * 0.8 * (0.9 + Math.random() * 0.2));
      case 'dark_storm':
        return Math.floor(boss.attack * 1.2 * (0.9 + Math.random() * 0.2));
      case 'summon_minions':
        return 0;
      case 'ice_blast':
        return Math.floor(boss.attack * 1.3 * (0.9 + Math.random() * 0.2));
      case 'frost_nova':
        return Math.floor(boss.attack * 0.7 * (0.9 + Math.random() * 0.2));
      default:
        return Math.floor(boss.attack * (0.9 + Math.random() * 0.2));
    }
  }

  checkPhaseTransition(boss) {
    const hpPercent = boss.currentHP / boss.hp;
    if (hpPercent <= 0.25) return 3;
    if (hpPercent <= 0.5) return 2;
    return 1;
  }

  bossDeath(boss, world) {
    const drops = [];
    for (const entry of boss.lootTable) {
      if (Math.random() < entry.chance) {
        if (entry.itemId) {
          drops.push({ type: 'item', item: { itemId: entry.itemId, name: entry.itemId, rarity: 'legendary' } });
        } else if (entry.gold) {
          const amount = entry.gold.min + Math.floor(Math.random() * (entry.gold.max - entry.gold.min));
          drops.push({ type: 'gold', amount });
        }
      }
    }

    const contributors = Array.from(boss.damageDealt.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    world.spawnSystem.despawnMonster(boss.instanceId);
    activeBosses.delete(boss.bossId);

    return { drops, contributors };
  }

  getActiveBoss(mapId) {
    return Array.from(activeBosses.values()).find((b) => b.mapId === mapId) || null;
  }

  getAllActiveBosses() {
    return Array.from(activeBosses.values());
  }
}

module.exports = new BossSystem();