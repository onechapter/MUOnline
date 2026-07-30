const Character = require('../models/Character');
const User = require('../models/User');
const CLASSES = require('../game/data/classes.json');

exports.createClass = async (req, res) => {
  try {
    const { name, class: charClass } = req.body;

    if (!name || !charClass) {
      return res.status(400).json({ success: false, error: 'Name and class required' });
    }

    if (name.length < 3 || name.length > 12 || !/^[a-zA-Z0-9]+$/.test(name)) {
      return res.status(400).json({ success: false, error: 'Name must be 3-12 alphanumeric characters' });
    }

    const classDef = CLASSES.find((c) => c.name === charClass);
    if (!classDef) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class. Choose: Dark Knight, Dark Wizard, Elf, Magic Gladiator, Dark Lord',
      });
    }

    const existing = await Character.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Character name already exists' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.characters.length >= 3) {
      return res.status(400).json({ success: false, error: 'Maximum 3 characters per account' });
    }

    const character = await Character.create({
      userId: req.userId,
      name,
      class: charClass,
      stats: { ...classDef.stats, points: 5 },
      maxHP: classDef.maxHP,
      maxMP: classDef.maxMP,
      currentHP: classDef.maxHP,
      currentMP: classDef.maxMP,
      skills: classDef.startingSkills,
    });

    user.characters.push(character._id);
    await user.save();

    res.status(201).json({ success: true, data: character });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.listCharacters = async (req, res) => {
  try {
    const characters = await Character.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: characters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!character) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }
    res.json({ success: true, data: character });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!character) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }

    await User.findByIdAndUpdate(req.userId, {
      $pull: { characters: character._id },
    });

    res.json({ success: true, message: 'Character deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getClasses = (_req, res) => {
  res.json({ success: true, data: CLASSES });
};

exports.updateStats = async (req, res) => {
  try {
    const { strength, agility, vitality, energy } = req.body;
    const character = await Character.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!character) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }

    const pointsToSpend = (strength ? strength - character.stats.strength : 0) +
      (agility ? agility - character.stats.agility : 0) +
      (vitality ? vitality - character.stats.vitality : 0) +
      (energy ? energy - character.stats.energy : 0);

    if (pointsToSpend > character.stats.points) {
      return res.status(400).json({ success: false, error: 'Not enough stat points' });
    }

    if (strength !== undefined) character.stats.strength = strength;
    if (agility !== undefined) character.stats.agility = agility;
    if (vitality !== undefined) character.stats.vitality = vitality;
    if (energy !== undefined) character.stats.energy = energy;

    character.stats.points -= pointsToSpend;
    await character.save();

    res.json({ success: true, data: character });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};