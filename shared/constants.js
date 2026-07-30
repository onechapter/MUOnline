export const CLASSES = [
  'Dark Knight',
  'Dark Wizard',
  'Elf',
  'Magic Gladiator',
  'Dark Lord',
];

export const RARITIES = ['Normal', 'Magic', 'Rare', 'Legendary', 'Ancient'];

export const DROP_RATES = {
  Normal: 0.5,
  Magic: 0.3,
  Rare: 0.15,
  Legendary: 0.04,
  Ancient: 0.01,
};

export const MAP_BOUNDS = { minX: 0, maxX: 256, minZ: 0, maxZ: 256 };

export const START_POSITION = { x: 128, y: 0, z: 128, mapId: 'lorencia' };

export const INVENTORY_SIZE = 64;

export const EQUIPMENT_SLOTS = [
  'weapon',
  'helmet',
  'armor',
  'pants',
  'gloves',
  'boots',
  'wings',
  'ring1',
  'ring2',
  'pendant',
];

export const SKILL_TYPES = ['Active', 'Passive', 'Buff', 'Debuff', 'AOE', 'Single'];

export function calcExpRequired(level) {
  return level * level * level * 10 + 1000;
}

export function calcExpGained(monsterExp, monsterLevel, playerLevel) {
  return Math.max(
    0,
    monsterExp * (1 + (monsterLevel - playerLevel) * 0.1)
  );
}

export function calcDamage(str, weaponDmg, def) {
  const base = str / 6 + weaponDmg;
  return Math.max(1, Math.round(base * (1 - def / (def + 100))));
}

export function calcMagicDamage(ene, magicDmg, def) {
  const base = ene / 9 + magicDmg;
  return Math.max(1, Math.round(base * (1 - def / (def + 100))));
}

export function isCriticalHit(agi) {
  return Math.random() * 100 < agi / 30;
}