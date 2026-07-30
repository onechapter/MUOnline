const MONSTERS = require('../data/monsters.json');

class SpawnSystem {
  constructor(world) {
    this.world = world;
    this.monsters = new Map();
    this.spawnTimers = new Map();
  }

  spawnMapMonsters(mapId) {
    const mapMonsters = MONSTERS.filter((m) => m.mapId === mapId);
    for (const template of mapMonsters) {
      const count = template.isBoss ? 1 : 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        this.spawnMonster(template, mapId);
      }
    }
  }

  spawnMonster(template, mapId) {
    const monster = {
      ...template,
      instanceId: `${template.monsterId}_${Date.now()}_${Math.random()}`,
      currentHP: template.hp,
      currentMP: template.mp || 0,
      position: {
        x: Math.random() * 256,
        y: 0,
        z: Math.random() * 256,
        mapId,
      },
      state: 'idle',
      spawnPoint: null,
      targetPlayer: null,
      lastAttack: 0,
    };

    monster.spawnPoint = {
      x: monster.position.x,
      y: monster.position.y,
      z: monster.position.z,
    };

    this.monsters.set(monster.instanceId, monster);

    if (!template.isBoss) {
      const respawnTime = 30000 + Math.random() * 30000;
      this.spawnTimers.set(monster.instanceId, {
        timer: respawnTime,
        template,
        mapId,
      });
    }

    return monster;
  }

  despawnMonster(instanceId) {
    const monster = this.monsters.get(instanceId);
    if (!monster) return;

    const timerData = this.spawnTimers.get(instanceId);
    if (timerData) {
      setTimeout(() => {
        this.spawnMonster(timerData.template, timerData.mapId);
      }, timerData.timer).unref?.();
    }

    this.monsters.delete(instanceId);
    this.spawnTimers.delete(instanceId);
    return monster;
  }

  getNearbyMonsters(x, z, mapId, range = 30) {
    return Array.from(this.monsters.values()).filter((m) => {
      if (m.position.mapId !== mapId) return false;
      const dx = m.position.x - x;
      const dz = m.position.z - z;
      return Math.sqrt(dx * dx + dz * dz) <= range;
    });
  }

  getByInstanceId(id) {
    return this.monsters.get(id) || null;
  }

  getAllOnMap(mapId) {
    return Array.from(this.monsters.values()).filter(
      (m) => m.position.mapId === mapId
    );
  }
}

module.exports = SpawnSystem;