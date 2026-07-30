class EnhancementSystem {
  enhanceItem(item, jewels) {
    if (!item || !item.stats) {
      return { success: false, error: 'Invalid item' };
    }

    if (item.enhancement >= 15) {
      return { success: false, error: 'Max enhancement reached' };
    }

    const currentLevel = item.enhancement || 0;
    const successRate = this.getSuccessRate(currentLevel);

    if (Math.random() > successRate) {
      return {
        success: false,
        enhanced: false,
        message: `Enhancement failed! Current: +${currentLevel}`,
        item: { ...item, enhancement: currentLevel },
      };
    }

    item.enhancement = currentLevel + 1;

    for (const [key, val] of Object.entries(item.stats)) {
      item.stats[key] = Math.round(val * (1 + item.enhancement * 0.1));
    }

    return {
      success: true,
      enhanced: true,
      message: `Enhanced to +${item.enhancement}!`,
      item,
    };
  }

  getSuccessRate(currentLevel) {
    const rates = [
      0.9, 0.85, 0.8, 0.75, 0.7,
      0.6, 0.5, 0.4, 0.35, 0.3,
      0.25, 0.2, 0.15, 0.1, 0.05,
    ];
    return rates[currentLevel] || 0.05;
  }

  canEnhance(item) {
    return item && item.enhancement < 15;
  }
}

module.exports = EnhancementSystem;