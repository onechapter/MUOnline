const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Character = require('../models/Character');

let token;
let userId;

const getToken = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'charuser',
      email: 'char@example.com',
      password: 'Pass123!',
    });
  token = res.body.data.token;
  userId = res.body.data.id;
};

const authHeader = () => ({ Authorization: `Bearer ${token}` });

describe('Character - Create', () => {
  beforeEach(async () => {
    await getToken();
  });

  it('should create character with valid data', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({
        name: 'HeroOne',
        class: 'Dark Knight',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('HeroOne');
    expect(res.body.data.class).toBe('Dark Knight');
  });

  it('should reject creation with duplicate name', async () => {
    await Character.create({
      userId,
      name: 'UniqueName',
      class: 'Elf',
    });

    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'UniqueName', class: 'Dark Wizard' });

    expect(res.status).toBe(409);
  });

  it('should reject creation with invalid class', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'BadClass', class: 'Ninja' });

    expect(res.status).toBe(400);
  });

  it('should reject creation with invalid name (too short)', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'AB', class: 'Elf' });

    expect(res.status).toBe(400);
  });

  it('should reject creation with invalid name (special chars)', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'Bad_Name!', class: 'Elf' });

    expect(res.status).toBe(400);
  });

  it('should initialize correct stats per class', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'StatTest', class: 'Elf' });

    expect(res.body.data.stats.strength).toBe(10);
    expect(res.body.data.stats.agility).toBe(20);
    expect(res.body.data.stats.points).toBeGreaterThan(0);
  });

  it('should set starting position to Lorencia', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set(authHeader())
      .send({ name: 'LocTest', class: 'Dark Lord' });

    expect(res.body.data.position.mapId).toBe('lorencia');
  });
});

describe('Character - List', () => {
  beforeEach(async () => {
    await getToken();
  });

  it('should return user characters', async () => {
    await Character.create({ userId, name: 'ListChar1', class: 'Elf' });
    await Character.create({ userId, name: 'ListChar2', class: 'Dark Wizard' });

    const res = await request(app)
      .get('/api/characters')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('should not return other users characters', async () => {
    const other = await User.create({
      username: 'other',
      email: 'other@example.com',
      password: 'hashed',
    });
    await Character.create({ userId: other._id, name: 'OtherChar', class: 'Elf' });

    const res = await request(app)
      .get('/api/characters')
      .set(authHeader());

    const names = res.body.data.map((c) => c.name);
    expect(names).not.toContain('OtherChar');
  });
});

describe('Character - Delete', () => {
  beforeEach(async () => {
    await getToken();
  });

  it('should delete own character', async () => {
    const char = await Character.create({ userId, name: 'DelMe', class: 'Elf' });

    const res = await request(app)
      .delete(`/api/characters/${char._id}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should not delete other users character', async () => {
    const other = await User.create({
      username: 'deleter',
      email: 'deleter@example.com',
      password: 'hashed',
    });
    const char = await Character.create({
      userId: other._id,
      name: 'SafeChar',
      class: 'Elf',
    });

    const res = await request(app)
      .delete(`/api/characters/${char._id}`)
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});

describe('Character - Classes API', () => {
  beforeEach(async () => {
    await getToken();
  });

  it('should return all class definitions', async () => {
    const res = await request(app)
      .get('/api/characters/classes')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
  });
});

describe('Character - Stats', () => {
  beforeEach(async () => {
    await getToken();
  });

  it('should update stats when points available', async () => {
    const char = await Character.create({
      userId,
      name: 'StatHero',
      class: 'Dark Knight',
      stats: { strength: 15, agility: 10, vitality: 15, energy: 5, points: 5 },
    });

    const res = await request(app)
      .patch(`/api/characters/${char._id}/stats`)
      .set(authHeader())
      .send({ strength: 17, agility: 12 });

    expect(res.status).toBe(200);
    expect(res.body.data.stats.strength).toBe(17);
    expect(res.body.data.stats.agility).toBe(12);
    expect(res.body.data.stats.points).toBe(1);
  });

  it('should reject stat update with insufficient points', async () => {
    const char = await Character.create({
      userId,
      name: 'NoPoints',
      class: 'Elf',
      stats: { strength: 10, agility: 20, vitality: 10, energy: 10, points: 0 },
    });

    const res = await request(app)
      .patch(`/api/characters/${char._id}/stats`)
      .set(authHeader())
      .send({ strength: 15 });

    expect(res.status).toBe(400);
  });
});

describe('Character - Unauthenticated', () => {
  it('should reject character access without auth', async () => {
    const res = await request(app).get('/api/characters');

    expect(res.status).toBe(401);
  });
});