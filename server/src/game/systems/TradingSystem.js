const activeTrades = new Map();

class TradingSystem {
  createTradeRequest(playerId, targetId) {
    if (activeTrades.has(playerId)) {
      return { success: false, error: 'Already in a trade' };
    }
    if (activeTrades.has(targetId)) {
      return { success: false, error: 'Target is in a trade' };
    }
    return { success: true, playerId, targetId };
  }

  acceptTrade(playerId, targetId) {
    if (activeTrades.has(playerId)) {
      return { success: false, error: 'Already in a trade' };
    }
    const trade = {
      id: `trade_${Date.now()}`,
      player1: { id: playerId, items: [], gold: 0, inventory: null, equipment: null },
      player2: { id: targetId, items: [], gold: 0, inventory: null, equipment: null },
      ready: { player1: false, player2: false },
      createdAt: Date.now(),
    };
    activeTrades.set(playerId, trade);
    activeTrades.set(targetId, trade);
    return { success: true, trade };
  }

  declineTrade(playerId) {
    const trade = activeTrades.get(playerId);
    if (!trade) return { success: false, error: 'No active trade' };
    const other = trade.player1.id === playerId ? trade.player2.id : trade.player1.id;
    this.cancelTrade(playerId);
    return { success: true, otherId: other };
  }

  addItemToTrade(playerId, trade, playerData, inventoryIndex) {
    const side = trade.player1.id === playerId ? trade.player1 : trade.player2;
    const item = playerData.inventory[inventoryIndex];
    if (!item) return { success: false, error: 'Item not found' };
    if (side.items.find((i) => i.sourceIndex === inventoryIndex)) {
      return { success: false, error: 'Item already in trade' };
    }
    side.items.push({ ...item, sourceIndex: inventoryIndex });
    return { success: true, trade };
  }

  removeItemFromTrade(playerId, trade, sourceIndex) {
    const side = trade.player1.id === playerId ? trade.player1 : trade.player2;
    const idx = side.items.findIndex((i) => i.sourceIndex === sourceIndex);
    if (idx === -1) return { success: false, error: 'Item not in trade' };
    side.items.splice(idx, 1);
    return { success: true, trade };
  }

  addGoldToTrade(playerId, trade, playerData, amount) {
    const side = trade.player1.id === playerId ? trade.player1 : trade.player2;
    if (amount < 0 || amount > playerData.gold) {
      return { success: false, error: 'Invalid gold amount' };
    }
    side.gold = amount;
    return { success: true, trade };
  }

  setReady(playerId, trade) {
    if (playerId === trade.player1.id) trade.ready.player1 = true;
    else trade.ready.player2 = true;
    return { success: true, trade };
  }

  executeTrade(trade, player1Data, player2Data) {
    if (!trade.ready.player1 || !trade.ready.player2) {
      return { success: false, error: 'Both players must be ready' };
    }

    const p1inv = player1Data.inventory;
    const p2inv = player2Data.inventory;

    const p1TradeGold = trade.player2.gold;
    const p2TradeGold = trade.player1.gold;

    if (p1inv.length + trade.player2.items.length > 64) {
      return { success: false, error: 'Player 1 inventory full' };
    }
    if (p2inv.length + trade.player1.items.length > 64) {
      return { success: false, error: 'Player 2 inventory full' };
    }

    for (const item of trade.player2.items) {
      p1inv.push(item);
    }
    for (const item of trade.player1.items) {
      p2inv.push(item);
    }

    player1Data.inventory = p1inv;
    player1Data.gold += p2TradeGold;
    player2Data.inventory = p2inv;
    player2Data.gold += p1TradeGold;

    for (const item of trade.player2.items.slice().reverse()) {
      const idx = player2Data.inventory.findIndex((i) => i.sourceIndex !== undefined && i.sourceIndex === item.sourceIndex);
      if (idx >= 0) player2Data.inventory.splice(idx, 1);
    }
    for (const item of trade.player1.items.slice().reverse()) {
      const idx = player1Data.inventory.findIndex((i) => i.sourceIndex !== undefined && i.sourceIndex === item.sourceIndex);
      if (idx >= 0) player1Data.inventory.splice(idx, 1);
    }

    player1Data.inventory = p1inv;
    player2Data.inventory = p2inv;

    this.cancelTrade(trade.player1.id);
    this.cancelTrade(trade.player2.id);

    return {
      success: true,
      player1Gold: player1Data.gold,
      player2Gold: player2Data.gold,
      player1Items: p1inv,
      player2Items: p2inv,
    };
  }

  cancelTrade(playerId) {
    const trade = activeTrades.get(playerId);
    if (trade) {
      activeTrades.delete(trade.player1.id);
      activeTrades.delete(trade.player2.id);
    }
    activeTrades.delete(playerId);
    return { success: true };
  }

  getTrade(playerId) {
    return activeTrades.get(playerId) || null;
  }
}

module.exports = new TradingSystem();