const bcrypt = require('bcrypt');
const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Character = require('../models/Character');

async function createUser(username, email) {
  const hashed = await bcrypt.hash('TestPass123!', 10);
  return User.create({ username, email, password: hashed });
}

async function getAuthToken(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'TestPass123!' });
  return res.body.data.token;
}

describe('E2E - Auth Flow', () => {
  it('should register and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'integuser', email: 'integ@test.com', password: 'TestPass123!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.username).toBe('integuser');
  });

  it('should login with valid credentials', async () => {
    await createUser('loginuser', 'login@test.com');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'TestPass123!' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should reject login with wrong password', async () => {
    await createUser('passuser', 'pass@test.com');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pass@test.com', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('should get profile with valid token', async () => {
    await createUser('profuser', 'prof@test.com');
    const token = await getAuthToken('prof@test.com');
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe('profuser');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should reject profile without token', async () => {
    expect((await request(app).get('/api/auth/profile')).status).toBe(401);
  });

  it('should reject profile with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });

  it('should refresh token', async () => {
    await createUser('refuser', 'ref@test.com');
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ref@test.com', password: 'TestPass123!' });
    const refreshToken = login.body.data.refreshToken;
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should reject refresh without token', async () => {
    expect((await request(app).post('/api/auth/refresh').send({})).status).toBe(401);
  });

  it('should reject refresh with invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid' });
    expect(res.status).toBe(401);
  });

  it('should logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('E2E - Character Flow', () => {
  let token;

  beforeEach(async () => {
    await createUser('charuser', 'char@test.com');
    token = await getAuthToken('char@test.com');
  });

  it('should create a character', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hero1', class: 'Dark Knight' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Hero1');
    expect(res.body.data.class).toBe('Dark Knight');
    expect(res.body.data.level).toBe(1);
  });

  it('should reject invalid character name', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ab', class: 'Elf' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid class', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hero1', class: 'InvalidClass' });
    expect(res.status).toBe(400);
  });

  it('should list user characters', async () => {
    await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hero1', class: 'Dark Knight' });
    await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Wizard1', class: 'Dark Wizard' });

    const res = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should get a specific character', async () => {
    const createRes = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hero1', class: 'Elf' });

    expect(createRes.status).toBe(201);
    const charId = createRes.body.data._id;
    const res = await request(app)
      .get(`/api/characters/${charId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Hero1');
  });

  it('should reject character creation without auth', async () => {
    const res = await request(app)
      .post('/api/characters')
      .send({ name: 'Test', class: 'Elf' });
    expect(res.status).toBe(401);
  });

  it('should delete a character', async () => {
    const createRes = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ToDelete', class: 'Elf' });

    const charId = createRes.body.data._id;
    const res = await request(app)
      .delete(`/api/characters/${charId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject deleting non-existent character', async () => {
    const res = await request(app)
      .delete('/api/characters/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('E2E - Game Data Routes', () => {
  it('should get all items', async () => {
    const res = await request(app).get('/api/game/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get all monsters', async () => {
    const res = await request(app).get('/api/game/monsters');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get all skills', async () => {
    const res = await request(app).get('/api/game/skills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get all maps', async () => {
    const res = await request(app).get('/api/game/maps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
  });

  it('should get all NPCs', async () => {
    const res = await request(app).get('/api/game/npcs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get all bosses', async () => {
    const res = await request(app).get('/api/game/bosses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });
});

describe('E2E - User Isolation', () => {
  it('should not see another user characters', async () => {
    await createUser('isouser1', 'iso1@test.com');
    await createUser('isouser2', 'iso2@test.com');

    const token1 = await getAuthToken('iso1@test.com');
    await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'IsoChar1', class: 'Dark Knight' });

    const token2 = await getAuthToken('iso2@test.com');
    await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'IsoChar2', class: 'Elf' });

    const chars1 = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token1}`);
    expect(chars1.body.data.every((c) => c.name === 'IsoChar1')).toBe(true);

    const chars2 = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token2}`);
    expect(chars2.body.data.every((c) => c.name === 'IsoChar2')).toBe(true);
  });
});

describe('E2E - Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});