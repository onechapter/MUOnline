const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    name: String,
    type: String,
    subType: String,
    level: Number,
    rarity: {
      type: String,
      enum: ['Normal', 'Magic', 'Rare', 'Legendary', 'Ancient'],
      default: 'Normal',
    },
    stats: {
      damage: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      hp: { type: Number, default: 0 },
      mp: { type: Number, default: 0 },
      strength: { type: Number, default: 0 },
      agility: { type: Number, default: 0 },
      vitality: { type: Number, default: 0 },
      energy: { type: Number, default: 0 },
    },
    durability: { current: Number, max: Number },
    enhancement: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    skillId: { type: String, required: true },
    level: { type: Number, default: 1 },
  },
  { _id: false }
);

const characterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 12,
      match: /^[a-zA-Z0-9]+$/,
    },
    class: {
      type: String,
      required: true,
      enum: [
        'Dark Knight',
        'Dark Wizard',
        'Elf',
        'Magic Gladiator',
        'Dark Lord',
      ],
    },
    level: { type: Number, default: 1, min: 1, max: 400 },
    experience: { type: Number, default: 0 },
    stats: {
      strength: { type: Number, default: 10 },
      agility: { type: Number, default: 10 },
      vitality: { type: Number, default: 10 },
      energy: { type: Number, default: 10 },
      points: { type: Number, default: 0 },
    },
    maxHP: { type: Number, default: 100 },
    maxMP: { type: Number, default: 50 },
    currentHP: { type: Number, default: 100 },
    currentMP: { type: Number, default: 50 },
    position: {
      mapId: { type: String, default: 'lorencia' },
      x: { type: Number, default: 128 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 128 },
    },
    inventory: [itemSchema],
    equipment: {
      weapon: itemSchema,
      helmet: itemSchema,
      armor: itemSchema,
      pants: itemSchema,
      gloves: itemSchema,
      boots: itemSchema,
      wings: itemSchema,
      ring1: itemSchema,
      ring2: itemSchema,
      pendant: itemSchema,
    },
    skills: [skillSchema],
    gold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Recalculate maxHP/MP from vitality/energy on save
characterSchema.pre('save', function () {
  this.maxHP = 100 + this.stats.vitality * 2;
  this.maxMP = 50 + this.stats.energy * 2;
  if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
  if (this.currentMP > this.maxMP) this.currentMP = this.maxMP;
});

module.exports = mongoose.model('Character', characterSchema);