const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');

describe('Auth - Register', () => {
  it('should register user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.username).toBe('testuser');
  });

  it('should reject registration with duplicate email', async () => {
    await User.create({
      username: 'existing',
      email: 'dup@example.com',
      password: 'hashed123',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'dup@example.com',
        password: 'Pass123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with duplicate username', async () => {
    await User.create({
      username: 'taken',
      email: 'other@example.com',
      password: 'hashed123',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'taken',
        email: 'different@example.com',
        password: 'Pass123!',
      });

    expect(res.status).toBe(409);
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'abc',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 6');
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
  });
});

describe('Auth - Login', () => {
  let bcrypt;

  beforeAll(() => {
    bcrypt = require('bcrypt');
  });

  it('should login with correct credentials', async () => {
    const hashed = await bcrypt.hash('mysecretpass', 10);
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: hashed,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'mysecretpass',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const hashed = await bcrypt.hash('correct', 10);
    await User.create({
      username: 'wronguser',
      email: 'wrong@example.com',
      password: hashed,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noone@example.com',
        password: 'whatever',
      });

    expect(res.status).toBe(401);
  });
});

describe('Auth - Protected Routes', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'prouser',
        email: 'pro@example.com',
        password: 'Pass123!',
      });
    token = res.body.data.token;
  });

  it('should access profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('username', 'prouser');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should reject access without token', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
  });
});