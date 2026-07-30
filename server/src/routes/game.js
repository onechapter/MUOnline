const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Character = require('../models/Character');
const ITEMS = require('../game/data/items.json');
const MONSTERS = require('../game/data/monsters.json');
const SKILLS = require('../game/data/skills.json');

router.get('/items', (req, res) => {
  res.json(ITEMS);
});

router.get('/monsters', (req, res) => {
  res.json(MONSTERS);
});

router.get('/skills', (req, res) => {
  res.json(SKILLS);
});

router.get('/maps', (req, res) => {
  const maps = [
    { mapId: 'lorencia', name: 'Lorencia', description: 'Starting town', levelRange: [1, 10] },
    { mapId: 'dungeon', name: 'Dungeon', description: 'Dark underground', levelRange: [5, 15] },
    { mapId: 'devias', name: 'Devias', description: 'Snowy mountains', levelRange: [15, 30] },
    { mapId: 'noria', name: 'Noria', description: 'Desert city', levelRange: [30, 40] },
    { mapId: 'atlans', name: 'Atlans', description: 'Ice cave', levelRange: [40, 50] },
  ];
  res.json(maps);
});

router.get('/player', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.userId).lean();
    if (!character) return res.status(404).json({ error: 'Character not found' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

router.get('/npcs', (req, res) => {
  const npcs = [
    { npcId: 'shop-lorencia', name: 'Shopkeeper', type: 'shop', mapId: 'lorencia', x: 130, z: 130 },
    { npcId: 'teleport-lorencia', name: 'Teleporter', type: 'teleport', mapId: 'lorencia', x: 126, z: 126 },
    { npcId: 'blacksmith', name: 'Blacksmith', type: 'repair', mapId: 'lorencia', x: 132, z: 128 },
  ];
  res.json(npcs);
});

router.get('/bosses', (req, res) => {
  const bosses = [
    { bossId: 'dragon', name: 'Dark Dragon', level: 50, mapId: 'atlans' },
    { bossId: 'demon', name: 'Demon King', level: 40, mapId: 'noria' },
    { bossId: 'ice_giant', name: 'Ice Giant', level: 30, mapId: 'devias' },
  ];
  res.json(bosses);
});

module.exports = router;