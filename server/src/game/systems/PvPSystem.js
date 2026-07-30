const activeDuels = new Map();
const pkFlags = new Map();

class PvPSystem {
  requestDuel(challengerId, opponentId) {
    if (activeDuels.has(challengerId)) {
      return { success: false, error: 'Already in a duel' };
    }
    if (activeDuels.has(opponentId)) {
      return { success: false, error: 'Opponent is in a duel' };
    }
    return { success: true, challengerId, opponentId };
  }

  acceptDuel(challengerId, opponentId, world) {
    const challenger = world?.getPlayer(challengerId);
    const opponent = world?.getPlayer(opponentId);
    if (!challenger || !opponent) {
      return { success: false, error: 'Player not found' };
    }
    const duel = {
      id: `duel_${Date.now()}`,
      challengerId,
      opponentId,
      challengerHP: challenger.currentHP,
      opponentHP: opponent.currentHP,
      startedAt: Date.now(),
      active: true,
    };
    activeDuels.set(challengerId, duel);
    activeDuels.set(opponentId, duel);
    return { success: true, duel };
  }

  duelAttack(world, attackerId, targetId) {
    const duel = activeDuels.get(attackerId);
    if (!duel || !duel.active) {
      return { success: false, error: 'Not in an active duel' };
    }
    const attacker = world?.getPlayer(attackerId);
    const target = world?.getPlayer(targetId);
    if (!attacker || !target) return { success: false, error: 'Player not found' };

    const weapon = attacker.equipment?.weapon;
    const baseDmg = attacker.stats?.strength || 10;
    const weaponDmg = weapon?.damage || 0;
    const def = target.stats?.strength || 10;
    const damage = Math.max(1, Math.floor((baseDmg / 6 + weaponDmg) * (1 + def / (def + 100)) * (0.9 + Math.random() * 0.2)));

    if (attackerId === duel.challengerId) {
      duel.opponentHP = Math.max(0, duel.opponentHP - damage);
    } else {
      duel.challengerHP = Math.max(0, duel.challengerHP - damage);
    }

    return { success: true, damage, attackerHP: attacker.currentHP, targetHP: duel.challengerId === targetId ? duel.challengerHP : duel.opponentHP };
  }

  endDuel(playerId) {
    const duel = activeDuels.get(playerId);
    if (!duel) return { success: false, error: 'Not in a duel' };
    duel.active = false;
    const winner = duel.challengerHP >= duel.opponentHP ? duel.challengerId : duel.opponentId;
    const loser = winner === duel.challengerId ? duel.opponentId : duel.challengerId;
    activeDuels.delete(duel.challengerId);
    activeDuels.delete(duel.opponentId);
    return { success: true, winner, loser, duel };
  }

  forfeitDuel(playerId) {
    const duel = activeDuels.get(playerId);
    if (!duel) return { success: false, error: 'Not in a duel' };
    duel.active = false;
    const winner = duel.challengerId === playerId ? duel.opponentId : duel.challengerId;
    activeDuels.delete(duel.challengerId);
    activeDuels.delete(duel.opponentId);
    return { success: true, winner, forfeitedBy: playerId };
  }

  setPKFlag(playerId, isPK) {
    if (isPK) {
      pkFlags.set(playerId, { count: (pkFlags.get(playerId)?.count || 0) + 1, flaggedAt: Date.now() });
    } else {
      pkFlags.delete(playerId);
    }
    return { success: true, isPK };
  }

  getPKFlag(playerId) {
    return pkFlags.get(playerId) || null;
  }

  playerKill(world, killerId, victimId) {
    this.setPKFlag(killerId, true);
    const killer = world?.getPlayer(killerId);
    const victim = world?.getPlayer(victimId);
    if (!killer || !victim) return { success: false, error: 'Player not found' };

    const penaltyGold = Math.floor(victim.gold * 0.1);
    victim.gold -= penaltyGold;
    killer.gold += penaltyGold;

    if (victim.currentHP <= 0) {
      victim.currentHP = victim.maxHP;
      victim.position = { x: 128, y: 0, z: 128, mapId: 'lorencia' };
    }

    return {
      success: true,
      killer: killer.name,
      victim: victim.name,
      penaltyGold,
      pkCount: pkFlags.get(killerId)?.count || 1,
    };
  }

  isDueling(playerId) {
    const duel = activeDuels.get(playerId);
    return duel?.active ?? false;
  }

  getDuel(playerId) {
    return activeDuels.get(playerId) || null;
  }
}

module.exports = new PvPSystem();