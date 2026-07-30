const { verifyToken } = require('../middleware/auth');
const Character = require('../models/Character');
const World = require('../game/World');

const world = new World();

let worldTickInterval;
let worldLoopRunning = false;

function startWorldLoop() {
  if (worldLoopRunning) return;
  worldLoopRunning = true;
  let lastTick = Date.now();
  worldTickInterval = setInterval(() => {
    const now = Date.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    world.tick(dt);
  }, 100).unref();
}

function stopWorldLoop() {
  if (worldTickInterval) {
    clearInterval(worldTickInterval);
    worldTickInterval = null;
  }
  worldLoopRunning = false;
}

async function authenticateSocket(socket) {
  const { token } = socket.handshake.auth;
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const characterId = socket.handshake.auth.characterId || decoded.characterId;
    if (!characterId) return null;
    const character = await Character.findById(characterId).lean();
    return character;
  } catch {
    return null;
  }
}

function socketHandler(io, socket) {
  console.log('[SOCKET] New connection from', socket.id);
  socket.on('auth:login', async (data) => {
    console.log('[SOCKET] auth:login from', socket.id);
    const player = await authenticateSocket(socket);
    if (!player) {
      console.log('[SOCKET] Auth failed for', socket.id);
      socket.emit('auth:error', { message: 'Authentication failed' });
      return;
    }
    console.log('[SOCKET] Auth success:', player.name, '(', player._id, ')');

    socket.data.player = player;
    world.addPlayer(player);

    const nearbyPlayers = world.getNearbyPlayers(
      player.position.x,
      player.position.z,
      player.position.mapId
    );

    const nearbyMonsters = world.spawnSystem.getNearbyMonsters(
      player.position.x,
      player.position.z,
      player.position.mapId,
      50
    );

    const nearbyNPCs = world.getNearbyNPCs(
      player.position.x,
      player.position.z,
      player.position.mapId,
      20
    );

    const nearbyItems = world.getNearbyItems(
      player.position.x,
      player.position.z,
      player.position.mapId,
      15
    );

    socket.emit('auth:success', {
      player,
      nearbyPlayers,
      nearbyMonsters,
      nearbyNPCs,
      nearbyItems,
    });

    socket.broadcast.emit('player:join', {
      id: player._id?.toString() || player.id,
      name: player.name,
      position: player.position,
      className: player.className,
    });

    startWorldLoop();
  });

  socket.on('player:move', (data) => {
    const player = socket.data.player;
    console.log('[player:move] socket.data.player exists:', !!player, 'data:', JSON.stringify(data));
    if (!player) {
      console.log('[player:move] NO PLAYER - auth may have failed');
      return;
    }

    const result = world.movementSystem.movePlayer(player, data.x, data.y, data.z);
    if (!result.success) {
      socket.emit('move:error', { message: result.error });
      return;
    }

    player.position = result.position;

    socket.emit('move:confirm', { position: result.position });
    socket.broadcast.emit('player:moved', {
      id: player._id?.toString() || player.id,
      position: result.position,
    });

    const nearbyMonsters = world.spawnSystem.getNearbyMonsters(
      result.position.x,
      result.position.z,
      result.position.mapId,
      50
    );
    socket.emit('world:monsters', { monsters: nearbyMonsters });

    const nearbyNPCs = world.getNearbyNPCs(
      result.position.x,
      result.position.z,
      result.position.mapId,
      20
    );
    socket.emit('world:npcs', { npcs: nearbyNPCs });
  });

  socket.on('player:attack', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const result = world.combatSystem.playerAttack(player, data.targetId);
    if (!result.success) {
      socket.emit('attack:error', { message: result.error });
      return;
    }

    socket.emit('attack:result', result);

    const monster = world.spawnSystem.getByInstanceId(data.targetId);
    if (monster && monster.currentHP <= 0) {
      const deathResult = world.processMonsterDeath(monster, player);

      await Character.findByIdAndUpdate(player._id, {
        experience: player.experience,
        level: player.level,
        gold: player.gold,
        stats: player.stats,
        maxHP: player.maxHP,
        maxMP: player.maxMP,
        currentHP: player.currentHP,
        currentMP: player.currentMP,
      });

      socket.emit('monster:dead', deathResult);
      socket.broadcast.emit('monster:dead', {
        targetId: monster.instanceId,
        mapId: monster.position.mapId,
      });
    } else if (monster) {
      socket.broadcast.emit('monster:damage', {
        targetId: monster.instanceId,
        hp: monster.currentHP,
        maxHP: monster.hp,
      });
    }

    if (monster && monster.currentHP > 0 && monster.state !== 'stunned') {
      monster.state = 'aggro';
      monster.targetPlayer = player;

      const monsterAttackResult = world.combatSystem.monsterAttack(monster, player);
      if (monsterAttackResult.success) {
        socket.emit('player:damage', monsterAttackResult);

        if (player.currentHP <= 0) {
          socket.emit('player:death', {
            message: 'You have been defeated!',
            respawnPosition: { x: 128, y: 0, z: 128, mapId: 'lorencia' },
          });
          player.currentHP = player.maxHP;
          player.position = { x: 128, y: 0, z: 128, mapId: 'lorencia' };

          await Character.findByIdAndUpdate(player._id, {
            currentHP: player.currentHP,
            position: player.position,
          });
        }
      }
    }
  });

  socket.on('player:useSkill', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const result = world.combatSystem.playerUseSkill(player, data.skillId, data.targetId);
    if (!result.success) {
      socket.emit('skill:error', { message: result.error });
      return;
    }

    socket.emit('skill:result', result);

    if (result.hits) {
      for (const hit of result.hits) {
        socket.broadcast.emit('monster:damage', hit);
        const m = world.spawnSystem.getByInstanceId(hit.targetId);
        if (m && m.currentHP <= 0) {
          const dr = world.processMonsterDeath(m, player);
          socket.emit('monster:dead', dr);
        }
      }
    }

    if (result.damage !== undefined && data.targetId) {
      socket.broadcast.emit('monster:damage', {
        targetId: data.targetId,
        hp: Math.max(0, result.targetHP),
        maxHP: result.targetMaxHP,
      });

      const m = world.spawnSystem.getByInstanceId(data.targetId);
      if (m && m.currentHP <= 0) {
        const dr = world.processMonsterDeath(m, player);
        socket.emit('monster:dead', dr);
      }
    }

    await Character.findByIdAndUpdate(player._id, {
      currentMP: player.currentMP,
      skills: player.skills,
    });
  });

  socket.on('chat:message', (data) => {
    const player = socket.data.player;
    if (!player) return;

    const chatMsg = {
      id: Date.now(),
      sender: player.name,
      senderId: player._id?.toString() || player.id,
      message: data.message.substring(0, 200),
      type: data.type || 'global',
      timestamp: Date.now(),
    };

    if (data.type === 'party') {
      if (!player.partyId) {
        socket.emit('chat:error', { message: 'Not in a party' });
        return;
      }
      io.to(`party_${player.partyId}`).emit('chat:message', chatMsg);
    } else if (data.type === 'guild') {
      if (!player.guildId) {
        socket.emit('chat:error', { message: 'Not in a guild' });
        return;
      }
      io.to(`guild_${player.guildId}`).emit('chat:message', chatMsg);
    } else {
      io.emit('chat:message', chatMsg);
    }
  });

  socket.on('npc:interact', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.npcSystem.interactWithNPC(player, data.npcId);
    socket.emit('npc:result', result);
  });

  socket.on('shop:buy', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.npcSystem.buyItem(player, data.npcId, data.itemId, data.quantity);
    if (!result.success) {
      socket.emit('shop:error', { message: result.error });
      return;
    }
    await Character.findByIdAndUpdate(player._id, {
      gold: player.gold,
      inventory: player.inventory,
    });
    socket.emit('shop:result', result);
  });

  socket.on('shop:sell', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.npcSystem.sellItem(player, data.npcId, data.inventoryIndex);
    if (!result.success) {
      socket.emit('shop:error', { message: result.error });
      return;
    }
    await Character.findByIdAndUpdate(player._id, {
      gold: player.gold,
      inventory: player.inventory,
    });
    socket.emit('shop:result', result);
  });

  socket.on('item:pickup', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const item = world.pickupItem(data.instanceId, player);
    if (!item) {
      socket.emit('item:error', { message: 'Cannot pick up item' });
      return;
    }
    await Character.findByIdAndUpdate(player._id, { inventory: player.inventory });
    socket.emit('item:picked', { item });
    socket.broadcast.emit('item:removed', { instanceId: data.instanceId });
  });

  socket.on('item:use', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.npcSystem.useItem(player, data.inventoryIndex);
    if (!result.success) {
      socket.emit('item:error', { message: result.error });
      return;
    }
    await Character.findByIdAndUpdate(player._id, {
      inventory: player.inventory,
      currentHP: player.currentHP,
      currentMP: player.currentMP,
    });
    socket.emit('item:result', result);
  });

  socket.on('equip:item', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const { inventoryIndex, slot } = data;
    const item = player.inventory[inventoryIndex];
    if (!item) return;

    if (!player.equipment) player.equipment = {};

    const previous = player.equipment[slot];
    player.equipment[slot] = item;
    player.inventory.splice(inventoryIndex, 1);
    if (previous) player.inventory.push(previous);

    player.maxHP = 100 + player.stats.vitality * 2;
    player.maxMP = 50 + player.stats.energy * 2;

    await Character.findByIdAndUpdate(player._id, {
      equipment: player.equipment,
      inventory: player.inventory,
      maxHP: player.maxHP,
      maxMP: player.maxMP,
    });

    socket.emit('equip:result', {
      success: true,
      equipment: player.equipment,
      previous: previous || null,
    });
  });

  socket.on('inventory:move', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const { from, to } = data;
    if (from < 0 || from >= player.inventory.length || to < 0 || to >= 64) return;

    [player.inventory[from], player.inventory[to]] = [player.inventory[to], player.inventory[from]];

    await Character.findByIdAndUpdate(player._id, { inventory: player.inventory });
    socket.emit('inventory:result', { success: true, inventory: player.inventory });
  });

  socket.on('stats:update', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const { stat, value } = data;
    const diff = value - player.stats[stat];

    if (player.stats.points < Math.abs(diff)) {
      socket.emit('stats:error', { message: 'Not enough stat points' });
      return;
    }
    if (player.stats[stat] + diff < 1) {
      socket.emit('stats:error', { message: 'Stat too low' });
      return;
    }

    player.stats[stat] += diff;
    player.stats.points -= Math.abs(diff);
    player.maxHP = 100 + player.stats.vitality * 2;
    player.maxMP = 50 + player.stats.energy * 2;

    await Character.findByIdAndUpdate(player._id, {
      stats: player.stats,
      maxHP: player.maxHP,
      maxMP: player.maxMP,
    });

    socket.emit('stats:result', {
      success: true,
      stats: player.stats,
      maxHP: player.maxHP,
      maxMP: player.maxMP,
    });
  });

  socket.on('map:change', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const result = world.movementSystem.teleportPlayer(
      player,
      data.mapId,
      data.x || 128,
      data.z || 128
    );
    if (!result) {
      socket.emit('map:error', { message: 'Cannot change map' });
      return;
    }

    await Character.findByIdAndUpdate(player._id, { position: player.position });

    socket.emit('map:changed', { position: player.position });

    const nearbyMonsters = world.spawnSystem.getNearbyMonsters(
      player.position.x,
      player.position.z,
      player.position.mapId,
      50
    );
    socket.emit('world:monsters', { monsters: nearbyMonsters });
  });

  socket.on('party:create', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const party = world.partySystem.createParty(player._id?.toString());
    if (!party.success) {
      socket.emit('party:error', { message: party.error });
      return;
    }
    player.partyId = party.party.id;
    socket.join(`party_${party.party.id}`);
    socket.emit('party:created', party.party);
  });

  socket.on('party:invite', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.partySystem.inviteToParty(player._id?.toString(), data.targetId);
    if (!result.success) {
      socket.emit('party:error', { message: result.error });
      return;
    }
    socket.emit('party:invited', result.party);
    socket.to(data.targetId).emit('party:invite', { from: player.name, partyId: result.party.id });
  });

  socket.on('party:leave', async () => {
    const player = socket.data.player;
    if (!player) return;
    const party = world.partySystem.getPartyForPlayer(player._id?.toString());
    if (party) {
      socket.leave(`party_${party.id}`);
      player.partyId = null;
      io.to(`party_${party.id}`).emit('party:left', { playerId: player._id?.toString(), name: player.name });
    }
    world.partySystem.leaveParty(player._id?.toString());
    socket.emit('party:left');
  });

  socket.on('guild:create', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.guildSystem.createGuild(data.name, player._id?.toString());
    if (!result.success) {
      socket.emit('guild:error', { message: result.error });
      return;
    }
    player.guildId = result.guild.id;
    socket.join(`guild_${result.guild.id}`);
    socket.emit('guild:created', result.guild);
  });

  socket.on('guild:invite', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const guild = world.guildSystem.isMemberOfGuild(player._id?.toString());
    if (!guild) {
      socket.emit('guild:error', { message: 'Not in a guild' });
      return;
    }
    const result = world.guildSystem.inviteToGuild(guild.id, data.targetId);
    if (!result.success) {
      socket.emit('guild:error', { message: result.error });
      return;
    }
    socket.to(data.targetId).emit('guild:invite', { guildId: guild.id, guildName: guild.name, from: player.name });
    socket.emit('guild:invited', { targetId: data.targetId });
  });

  socket.on('guild:accept', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.guildSystem.acceptInvite(player._id?.toString());
    if (!result.success) {
      socket.emit('guild:error', { message: result.error });
      return;
    }
    player.guildId = result.guild.id;
    socket.join(`guild_${result.guild.id}`);
    socket.emit('guild:joined', result.guild);
  });

  socket.on('guild:leave', async () => {
    const player = socket.data.player;
    if (!player) return;
    const guild = world.guildSystem.isMemberOfGuild(player._id?.toString());
    if (guild) {
      socket.leave(`guild_${guild.id}`);
      player.guildId = null;
    }
    const result = world.guildSystem.leaveGuild(player._id?.toString());
    socket.emit('guild:left', result);
  });

  socket.on('enhance:item', async (data) => {
    const player = socket.data.player;
    if (!player) return;

    const item = player.inventory[data.inventoryIndex] || player.equipment?.[data.slot];
    if (!item) {
      socket.emit('enhance:error', { message: 'Item not found' });
      return;
    }

    const cost = 1000 * (item.enhancement || 0) + 500;
    if (player.gold < cost) {
      socket.emit('enhance:error', { message: 'Not enough gold' });
      return;
    }

    player.gold -= cost;
    const result = world.enhancementSystem.enhanceItem(item, data.jewels);

    if (result.enhanced) {
      socket.emit('enhance:success', {
        item: result.item,
        message: result.message,
        gold: player.gold,
      });
    } else {
      socket.emit('enhance:failed', {
        item: result.item,
        message: result.message,
        gold: player.gold,
      });
    }

    await Character.findByIdAndUpdate(player._id, {
      gold: player.gold,
      inventory: player.inventory,
      equipment: player.equipment,
    });
  });

  socket.on('trade:request', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.tradingSystem.createTradeRequest(player._id?.toString(), data.targetId);
    if (!result.success) {
      socket.emit('trade:error', { message: result.error });
      return;
    }
    socket.to(data.targetId).emit('trade:request', {
      from: player.name,
      playerId: player._id?.toString(),
      targetId: data.targetId,
    });
    socket.emit('trade:request', { to: data.targetId, sent: true });
  });

  socket.on('trade:accept', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.tradingSystem.acceptTrade(
      data.challengerId || player._id?.toString(),
      data.targetId || player._id?.toString()
    );
    if (!result.success) {
      socket.emit('trade:error', { message: result.error });
      return;
    }
    const challengerSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.data.player?._id?.toString() === data.challengerId
    );
    if (challengerSocket) {
      challengerSocket.emit('trade:accepted', { trade: result.trade });
    }
    socket.emit('trade:accepted', { trade: result.trade });
  });

  socket.on('trade:decline', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.tradingSystem.declineTrade(player._id?.toString());
    if (result.success && result.otherId) {
      socket.to(result.otherId).emit('trade:declined', { message: 'Trade declined' });
    }
    socket.emit('trade:declined');
  });

  socket.on('trade:item', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const trade = world.tradingSystem.getTrade(player._id?.toString());
    if (!trade) {
      socket.emit('trade:error', { message: 'No active trade' });
      return;
    }
    const result = world.tradingSystem.addItemToTrade(
      player._id?.toString(),
      trade,
      player,
      data.inventoryIndex
    );
    if (!result.success) {
      socket.emit('trade:error', { message: result.error });
      return;
    }
    const otherId = trade.player1.id === player._id?.toString() ? trade.player2.id : trade.player1.id;
    socket.to(otherId).emit('trade:updated', { trade });
    socket.emit('trade:updated', { trade });
  });

  socket.on('trade:gold', async (data) => {
    const player = socket.data.player;
    if (!player) return;
    const trade = world.tradingSystem.getTrade(player._id?.toString());
    if (!trade) {
      socket.emit('trade:error', { message: 'No active trade' });
      return;
    }
    const result = world.tradingSystem.addGoldToTrade(
      player._id?.toString(),
      trade,
      player,
      data.amount
    );
    if (!result.success) {
      socket.emit('trade:error', { message: result.error });
      return;
    }
    const otherId = trade.player1.id === player._id?.toString() ? trade.player2.id : trade.player1.id;
    socket.to(otherId).emit('trade:updated', { trade });
    socket.emit('trade:updated', { trade });
  });

  socket.on('trade:ready', async () => {
    const player = socket.data.player;
    if (!player) return;
    const trade = world.tradingSystem.getTrade(player._id?.toString());
    if (!trade) {
      socket.emit('trade:error', { message: 'No active trade' });
      return;
    }
    world.tradingSystem.setReady(player._id?.toString(), trade);
    const otherId = trade.player1.id === player._id?.toString() ? trade.player2.id : trade.player1.id;
    socket.to(otherId).emit('trade:ready', { trade });
    socket.emit('trade:ready', { trade });
  });

  socket.on('trade:complete', async () => {
    const player = socket.data.player;
    if (!player) return;
    const trade = world.tradingSystem.getTrade(player._id?.toString());
    if (!trade) {
      socket.emit('trade:error', { message: 'No active trade' });
      return;
    }
    const otherId = trade.player1.id === player._id?.toString() ? trade.player2.id : trade.player1.id;
    const otherPlayer = world.getPlayer(otherId);
    if (!otherPlayer) {
      socket.emit('trade:error', { message: 'Other player disconnected' });
      return;
    }

    if (!trade.ready.player1 || !trade.ready.player2) {
      socket.emit('trade:error', { message: 'Both players must be ready' });
      return;
    }

    const result = world.tradingSystem.executeTrade(trade, player, otherPlayer);
    if (!result.success) {
      socket.emit('trade:error', { message: result.error });
      return;
    }

    await Character.findByIdAndUpdate(player._id, {
      gold: player.gold,
      inventory: player.inventory,
    });
    await Character.findByIdAndUpdate(otherId, {
      gold: otherPlayer.gold,
      inventory: otherPlayer.inventory,
    });

    socket.emit('trade:completed', { gold: player.gold, inventory: player.inventory });
    socket.to(otherId).emit('trade:completed', { gold: otherPlayer.gold, inventory: otherPlayer.inventory });
  });

  socket.on('trade:cancel', () => {
    const player = socket.data.player;
    if (!player) return;
    const trade = world.tradingSystem.getTrade(player._id?.toString());
    if (trade) {
      const otherId = trade.player1.id === player._id?.toString() ? trade.player2.id : trade.player1.id;
      socket.to(otherId).emit('trade:cancelled');
    }
    world.tradingSystem.cancelTrade(player._id?.toString());
    socket.emit('trade:cancelled');
  });

  socket.on('pvp:duel', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.pvpSystem.requestDuel(player._id?.toString(), data.opponentId);
    if (!result.success) {
      socket.emit('pvp:error', { message: result.error });
      return;
    }
    socket.to(data.opponentId).emit('pvp:challenge', {
      from: player.name,
      challengerId: player._id?.toString(),
      opponentId: data.opponentId,
    });
    socket.emit('pvp:challenge', { sent: true });
  });

  socket.on('pvp:acceptDuel', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.pvpSystem.acceptDuel(
      data.challengerId,
      player._id?.toString(),
      world
    );
    if (!result.success) {
      socket.emit('pvp:error', { message: result.error });
      return;
    }
    socket.to(data.challengerId).emit('pvp:started', { duel: result.duel });
    socket.emit('pvp:started', { duel: result.duel });
  });

  socket.on('pvp:duelAttack', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const result = world.pvpSystem.duelAttack(world, player._id?.toString(), data.targetId);
    if (!result.success) {
      socket.emit('pvp:error', { message: result.error });
      return;
    }
    socket.emit('pvp:hit', result);
    socket.to(data.targetId).emit('pvp:hit', result);

    const duel = world.pvpSystem.getDuel(player._id?.toString());
    if (duel && (duel.challengerHP <= 0 || duel.opponentHP <= 0)) {
      const endResult = world.pvpSystem.endDuel(player._id?.toString());
      socket.emit('pvp:ended', endResult);
      socket.to(data.targetId).emit('pvp:ended', endResult);
    }
  });

  socket.on('pvp:forfeit', () => {
    const player = socket.data.player;
    if (!player) return;
    const duel = world.pvpSystem.getDuel(player._id?.toString());
    if (!duel) {
      socket.emit('pvp:error', { message: 'Not in a duel' });
      return;
    }
    const result = world.pvpSystem.forfeitDuel(player._id?.toString());
    const otherId = duel.challengerId === player._id?.toString() ? duel.opponentId : duel.challengerId;
    socket.emit('pvp:ended', result);
    socket.to(otherId).emit('pvp:ended', result);
  });

  socket.on('boss:schedule', () => {
    const player = socket.data.player;
    if (!player) return;
    for (const template of world.bossSystem.bossTemplates) {
      world.bossSystem.scheduleBoss(template.bossId, world);
    }
    socket.emit('boss:scheduled', { message: 'All bosses scheduled' });
  });

  socket.on('boss:attack', (data) => {
    const player = socket.data.player;
    if (!player) return;
    const boss = world.spawnSystem.getByInstanceId(data.bossInstanceId);
    if (!boss || boss.currentHP <= 0) {
      socket.emit('boss:error', { message: 'Boss not found or dead' });
      return;
    }

    const weapon = player.equipment?.weapon;
    const baseDmg = player.stats?.strength || 10;
    const weaponDmg = weapon?.damage || 0;
    const def = boss.defense || 10;
    const damage = Math.max(1, Math.floor((baseDmg / 6 + weaponDmg) * (1 - def / (def + 100)) * (0.9 + Math.random() * 0.2)));

    if (!boss.damageDealt) boss.damageDealt = new Map();
    boss.damageDealt.set(player._id?.toString(), (boss.damageDealt.get(player._id?.toString()) || 0) + damage);
    boss.currentHP = Math.max(0, boss.currentHP - damage);

    socket.emit('boss:damage', { currentHP: boss.currentHP, maxHP: boss.hp });
    io.emit('boss:hit', { bossId: boss.bossId, currentHP: boss.currentHP, maxHP: boss.hp });

    const newPhase = world.bossSystem.checkPhaseTransition(boss);
    if (newPhase !== boss.phase) {
      boss.phase = newPhase;
      io.emit('boss:phase', { bossId: boss.bossId, phase: newPhase });
    }

    if (Math.random() < 0.3) {
      const special = world.bossSystem.specialAttack(boss, world);
      io.emit('boss:special', { bossId: boss.bossId, ...special });
    }

    if (boss.currentHP <= 0) {
      const deathResult = world.bossSystem.bossDeath(boss, world);
      io.emit('boss:dead', { bossId: boss.bossId, name: boss.name, ...deathResult });
      socket.emit('boss:dead', deathResult);
    }
  });

  socket.on('disconnect', async () => {
    const player = socket.data.player;
    if (player) {
      const playerId = player._id?.toString() || player.id;

      await Character.findByIdAndUpdate(playerId, {
        currentHP: player.currentHP,
        currentMP: player.currentMP,
        position: player.position,
        experience: player.experience,
        level: player.level,
        gold: player.gold,
        inventory: player.inventory,
        equipment: player.equipment,
        stats: player.stats,
      });

      world.removePlayer(playerId);
      socket.broadcast.emit('player:left', { id: playerId, name: player.name });
    }

    if (world.players.size === 0) {
      stopWorldLoop();
    }
  });
}

module.exports = { socketHandler, world, stopWorldLoop };