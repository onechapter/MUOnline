const calcDamage = (str, weaponDmg, def) => {
  const base = str / 6 + weaponDmg;
  return Math.max(1, Math.round(base * (1 - def / (def + 100))));
};

const calcMagicDamage = (ene, magicDmg, def) => {
  const base = ene / 9 + magicDmg;
  return Math.max(1, Math.round(base * (1 - def / (def + 100))));
};

const isCriticalHit = (agi) => Math.random() * 100 < agi / 30;

class CombatSystem {
  constructor(world) {
    this.world = world;
  }

  playerAttack(player, targetId) {
    const monster = this.world.spawnSystem.getByInstanceId(targetId);
    if (!monster) return { success: false, error: 'Target not found' };

    if (player.position.mapId !== monster.position.mapId) {
      return { success: false, error: 'Target not in same map' };
    }

    const dist = this.distance(player.position, monster.position);
    const attackRange = player.equipment?.weapon ? 3 : 2;
    if (dist > attackRange) {
      return { success: false, error: 'Target out of range' };
    }

    const weaponDmg = player.equipment?.weapon?.stats?.damage || 0;
    let damage = calcDamage(player.stats.strength, weaponDmg, monster.defense);

    let isCrit = isCriticalHit(player.stats.agility);
    if (isCrit) {
      damage = Math.round(damage * 1.5);
    }

    const variance = 0.9 + Math.random() * 0.2;
    damage = Math.round(damage * variance);

    monster.currentHP -= damage;

    return {
      success: true,
      damage,
      isCrit,
      targetHP: Math.max(0, monster.currentHP),
      targetMaxHP: monster.hp,
    };
  }

  playerUseSkill(player, skillId, targetId) {
    const skill = player.skills?.find((s) => s.skillId === skillId);
    if (!skill) return { success: false, error: 'Skill not learned' };

    const skillData = require('../data/skills.json').find(
      (s) => s.skillId === skillId
    );
    if (!skillData) return { success: false, error: 'Invalid skill' };

    if (player.currentMP < skillData.manaCost) {
      return { success: false, error: 'Not enough MP' };
    }

    const now = Date.now();
    if (player.skillCooldowns?.[skillId] && now - player.skillCooldowns[skillId] < skillData.cooldown) {
      return { success: false, error: 'Skill on cooldown' };
    }

    player.currentMP -= skillData.manaCost;
    if (!player.skillCooldowns) player.skillCooldowns = {};
    player.skillCooldowns[skillId] = now;

    if (skillData.type === 'AOE') {
      return this.executeAOESkill(player, skillData, targetId);
    }

    if (skillData.type === 'Buff') {
      return this.executeBuffSkill(player, skillData);
    }

    if (targetId) {
      const monster = this.world.spawnSystem.getByInstanceId(targetId);
      if (!monster) return { success: false, error: 'Target not found' };

      let damage = skillData.damage + (player.stats.strength / 6) * skill.level;
      if (skillData.type === 'Active' && isCriticalHit(player.stats.agility)) {
        damage = Math.round(damage * 1.5);
      }

      monster.currentHP -= damage;

      if (skillData.effect === 'stun') {
        monster.state = 'stunned';
        setTimeout(() => {
          if (monster.state === 'stunned') monster.state = 'idle';
        }, skillData.duration);
      }

      return {
        success: true,
        damage: Math.round(damage),
        targetHP: Math.max(0, monster.currentHP),
        targetMaxHP: monster.hp,
        effect: skillData.effect,
      };
    }

    return { success: false, error: 'Target required' };
  }

  executeAOESkill(player, skillData, targetId) {
    const targets = this.world.spawnSystem.getNearbyMonsters(
      player.position.x,
      player.position.z,
      player.position.mapId,
      10
    );

    const hits = [];
    for (const target of targets) {
      let damage = skillData.damage + (player.stats.strength / 6);
      target.currentHP -= damage;
      hits.push({
        targetId: target.instanceId,
        damage: Math.round(damage),
        hp: Math.max(0, target.currentHP),
      });
    }

    return { success: true, hits, effect: skillData.effect };
  }

  executeBuffSkill(player, skillData) {
    if (!player.buffs) player.buffs = [];
    player.buffs.push({
      skillId: skillData.skillId,
      effect: skillData.effect,
      value: skillData.value,
      expiresAt: Date.now() + skillData.duration,
    });

    return { success: true, effect: skillData.effect, value: skillData.value };
  }

  monsterAttack(monster, player) {
    const now = Date.now();
    if (now - monster.lastAttack < monster.attackSpeed) {
      return { success: false, error: 'Attack cooldown' };
    }
    monster.lastAttack = now;

    let damage = calcDamage(monster.attack, 0, player.stats.vitality);
    const variance = 0.9 + Math.random() * 0.2;
    damage = Math.round(damage * variance);

    player.currentHP -= damage;

    return {
      success: true,
      damage,
      playerHP: Math.max(0, player.currentHP),
      playerMaxHP: player.maxHP,
    };
  }

  distance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

module.exports = CombatSystem;