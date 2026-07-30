class MonsterAI {
  constructor(world) {
    this.world = world;
  }

  updateMonster(monster, dt) {
    if (monster.currentHP <= 0) return;
    if (monster.state === 'stunned') return;

    switch (monster.state) {
      case 'idle':
        this.handleIdle(monster);
        break;
      case 'patrol':
        this.handlePatrol(monster, dt);
        break;
      case 'aggro':
        this.handleAggro(monster);
        break;
      case 'chase':
        this.handleChase(monster, dt);
        break;
      case 'attack':
        this.handleAttack(monster);
        break;
    }
  }

  handleIdle(monster) {
    const roll = Math.random();
    if (roll < 0.3) {
      monster.state = 'patrol';
      monster.patrolTarget = {
        x: monster.spawnPoint.x + (Math.random() - 0.5) * 40,
        z: monster.spawnPoint.z + (Math.random() - 0.5) * 40,
      };
    }
  }

  handlePatrol(monster, dt) {
    const dx = monster.patrolTarget.x - monster.position.x;
    const dz = monster.patrolTarget.z - monster.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1) {
      monster.state = 'idle';
      return;
    }

    const speed = monster.speed || 2;
    monster.position.x += (dx / dist) * speed * dt;
    monster.position.z += (dz / dist) * speed * dt;

    const nearbyPlayers = this.world.getNearbyPlayers
      ? this.world.getNearbyPlayers(monster.position.x, monster.position.z, monster.position.mapId, monster.aggroRange || 15)
      : [];

    if (nearbyPlayers.length > 0) {
      monster.state = 'aggro';
      monster.targetPlayer = nearbyPlayers[0];
    }
  }

  handleAggro(monster) {
    if (!monster.targetPlayer || monster.targetPlayer.currentHP <= 0) {
      monster.state = 'idle';
      monster.targetPlayer = null;
      return;
    }

    const dist = this.distance(monster.position, monster.targetPlayer.position);
    if (dist > monster.aggroRange + 5) {
      monster.state = 'idle';
      return;
    }

    if (dist > monster.attackRange) {
      monster.state = 'chase';
    } else {
      monster.state = 'attack';
    }
  }

  handleChase(monster, dt) {
    if (!monster.targetPlayer) {
      monster.state = 'idle';
      return;
    }

    const dist = this.distance(monster.position, monster.targetPlayer.position);

    if (dist <= monster.attackRange) {
      monster.state = 'attack';
      return;
    }

    if (dist > monster.aggroRange + 10) {
      monster.state = 'idle';
      return;
    }

    const dx = monster.targetPlayer.position.x - monster.position.x;
    const dz = monster.targetPlayer.position.z - monster.position.z;
    const speed = monster.speed || 2;
    monster.position.x += (dx / dist) * speed * dt;
    monster.position.z += (dz / dist) * speed * dt;
  }

  handleAttack(monster) {
    if (!monster.targetPlayer) {
      monster.state = 'idle';
      return;
    }

    const dist = this.distance(monster.position, monster.targetPlayer.position);
    if (dist > monster.attackRange) {
      monster.state = 'chase';
      return;
    }

    const now = Date.now();
    if (now - monster.lastAttack >= monster.attackSpeed) {
      monster.lastAttack = now;

      const world = this.world;
      if (world.combatSystem) {
        world.combatSystem.monsterAttack(monster, monster.targetPlayer);
      }
    }
  }

  distance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

module.exports = MonsterAI;