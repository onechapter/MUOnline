const ITEMS = require('../data/items.json');

const DROP_RATES = {
  Normal: 0.5,
  Magic: 0.3,
  Rare: 0.15,
  Legendary: 0.04,
  Ancient: 0.01,
};

class DropSystem {
  generateDrop(monster) {
    const drops = [];

    const gold =
      monster.goldReward.min +
      Math.floor(Math.random() * (monster.goldReward.max - monster.goldReward.min + 1));
    drops.push({ type: 'gold', amount: gold });

    for (const entry of monster.dropTable) {
      if (Math.random() < entry.chance) {
        const itemTemplate = ITEMS.find((i) => i.itemId === entry.itemId);
        if (itemTemplate) {
          const item = this.generateItem(itemTemplate, monster.level);
          drops.push({ type: 'item', item });
        }
      }
    }

    return drops;
  }

  generateItem(template, monsterLevel) {
    const roll = Math.random();
    let rarity = 'Normal';
    for (const [r, rate] of Object.entries(DROP_RATES)) {
      if (roll < rate) {
        rarity = r;
        break;
      }
    }

    const multiplier =
      { Normal: 1, Magic: 1.3, Rare: 1.6, Legendary: 2.2, Ancient: 3.0 }[rarity] || 1;

    const stats = {};
    for (const [key, val] of Object.entries(template.stats)) {
      stats[key] = Math.round(val * multiplier);
    }

    return {
      ...template,
      rarity,
      stats,
      enhancement: 0,
      quantity: template.stackable ? 1 : 1,
    };
  }

  calculateExp(monster, player) {
    const baseExp = monster.expReward;
    const levelDiff = monster.level - player.level;
    const multiplier = 1 + levelDiff * 0.1;
    return Math.max(1, Math.round(baseExp * multiplier));
  }
}

module.exports = DropSystem;