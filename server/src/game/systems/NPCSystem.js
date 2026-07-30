const ITEMS = require('../data/items.json');

class NPCSystem {
  constructor(world) {
    this.world = world;
  }

  interactWithNPC(player, npcId) {
    const npc = this.world.npcs.get(npcId);
    if (!npc) return { success: false, error: 'NPC not found' };

    const dist = Math.sqrt(
      Math.pow(player.position.x - npc.position.x, 2) +
      Math.pow(player.position.z - npc.position.z, 2)
    );
    if (dist > 5) return { success: false, error: 'NPC too far' };

    switch (npc.type) {
      case 'shop':
        return this.openShop(player, npc);
      case 'teleport':
        return this.offerTeleport(player, npc);
      case 'repair':
        return { success: true, type: 'repair', message: 'Repair services available' };
      case 'quest':
        return { success: true, type: 'quest', quests: npc.quests || [] };
      default:
        return { success: false, error: 'Unknown NPC type' };
    }
  }

  openShop(player, npc) {
    const shopItems = [];
    for (const entry of npc.shopItems) {
      const item = ITEMS.find((i) => i.itemId === entry.itemId);
      if (item) {
        shopItems.push({
          ...item,
          price: entry.price,
        });
      }
    }
    return {
      success: true,
      type: 'shop',
      npcName: npc.name,
      items: shopItems,
    };
  }

  offerTeleport(player, npc) {
    const destinations = npc.destinations || [
      { mapId: 'dungeon', x: 128, z: 128 },
      { mapId: 'devias', x: 128, z: 128 },
    ];
    return {
      success: true,
      type: 'teleport',
      destinations,
    };
  }

  teleportToMap(player, npcId, mapId, x, z) {
    const result = this.world.movementSystem.teleportPlayer(player, mapId, x, z);
    return { success: result };
  }

  buyItem(player, npcId, itemId, quantity = 1) {
    const npc = this.world.npcs.get(npcId);
    if (!npc || npc.type !== 'shop') return { success: false, error: 'Not a shop' };

    const shopEntry = npc.shopItems.find((s) => s.itemId === itemId);
    if (!shopEntry) return { success: false, error: 'Item not in shop' };

    const totalCost = shopEntry.price * quantity;
    if (player.gold < totalCost) return { success: false, error: 'Not enough gold' };

    if (player.inventory.length + quantity > 64) {
      return { success: false, error: 'Inventory full' };
    }

    const itemTemplate = ITEMS.find((i) => i.itemId === itemId);
    if (!itemTemplate) return { success: false, error: 'Invalid item' };

    player.gold -= totalCost;
    for (let i = 0; i < quantity; i++) {
      player.inventory.push({
        ...itemTemplate,
        rarity: 'Normal',
        enhancement: 0,
        quantity: 1,
      });
    }

    return {
      success: true,
      remainingGold: player.gold,
      itemsBought: quantity,
    };
  }

  sellItem(player, npcId, inventoryIndex) {
    const npc = this.world.npcs.get(npcId);
    if (!npc || npc.type !== 'shop') return { success: false, error: 'Not a shop' };

    const item = player.inventory[inventoryIndex];
    if (!item) return { success: false, error: 'Invalid item' };

    const sellPrice = Math.floor((item.price || 50) * 0.5);
    player.gold += sellPrice;
    player.inventory.splice(inventoryIndex, 1);

    return {
      success: true,
      goldReceived: sellPrice,
      remainingGold: player.gold,
    };
  }

  useItem(player, inventoryIndex) {
    const item = player.inventory[inventoryIndex];
    if (!item) return { success: false, error: 'Invalid item' };

    if (item.itemType === 'consumable') {
      if (item.effect === 'heal') {
        player.currentHP = Math.min(player.maxHP, player.currentHP + item.value);
      } else if (item.effect === 'mana') {
        player.currentMP = Math.min(player.maxMP, player.currentMP + item.value);
      }

      player.inventory.splice(inventoryIndex, 1);
      return { success: true, currentHP: player.currentHP, currentMP: player.currentMP };
    }

    return { success: false, error: 'Not consumable' };
  }
}

module.exports = NPCSystem;