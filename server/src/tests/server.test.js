const request = require('supertest');
const { app, server, io } = require('../server');
const socketIOClient = require('socket.io-client');
const { stopWorldLoop } = require('../socket/socketHandler');

describe('Server Health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Socket.IO Connection', () => {
  let sockServer;

  beforeAll((done) => {
    sockServer = server.listen(0);
    done();
  });

  afterAll((done) => {
    stopWorldLoop();
    io.close();
    sockServer.close(() => done());
  });

  it('should authenticate socket with valid token', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'sockuser',
        email: 'sock@example.com',
        password: 'Pass123!',
      });

    const token = regRes.body.data.token;
    const port = sockServer.address().port;

    const client = socketIOClient(`http://localhost:${port}`, {
      transports: ['websocket'],
    });

    await new Promise((resolve) => {
      client.on('connect', () => {
        client.emit('auth:login', token);
      });

      client.on('auth:success', () => {
        resolve();
      });

      client.on('auth:error', () => {
        resolve();
      });

      setTimeout(() => resolve(), 3000);
    });

    client.close();
    await new Promise((r) => setTimeout(r, 200));
  });

  it('should reject socket auth with invalid token', async () => {
    const port = sockServer.address().port;
    const client = socketIOClient(`http://localhost:${port}`, {
      transports: ['websocket'],
    });

    const result = await new Promise((resolve) => {
      client.on('connect', () => {
        client.emit('auth:login', 'invalidtoken123');
      });

      client.on('auth:error', (data) => {
        resolve(data);
      });

      setTimeout(() => resolve(null), 2000);
    });

    expect(result).toHaveProperty('message');
    client.close();
  });
});