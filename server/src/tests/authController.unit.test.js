const bcrypt = require('bcrypt');

// Mock the dependencies before importing the controller
jest.mock('bcrypt');
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../middleware/auth', () => ({
  generateToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

// --- Shared mocks ---

const mockUserId = '507f1f77bcf86cd799439011';
const mockUserDoc = {
  _id: mockUserId,
  username: 'testuser',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
};

const mockToken = 'jwt-token-123';
const mockRefreshToken = 'refresh-token-456';

function mockReq(body) {
  return { body, userId: mockUserId };
}

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  generateToken.mockReturnValue(mockToken);
  generateRefreshToken.mockReturnValue(mockRefreshToken);
});

// ============================================================
//  REGISTER
// ============================================================
describe('authController.register', () => {
  describe('Validation', () => {
    it('should return 400 when all fields are missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'All fields required',
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 when username is missing', async () => {
      const req = mockReq({ email: 'a@b.com', password: 'Pass123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'All fields required' });
    });

    it('should return 400 when email is missing', async () => {
      const req = mockReq({ username: 'testuser', password: 'Pass123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'All fields required' });
    });

    it('should return 400 when password is missing', async () => {
      const req = mockReq({ username: 'testuser', email: 'a@b.com' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'All fields required' });
    });

    it('should return 400 when password is empty string', async () => {
      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: '' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'All fields required' });
    });

    it('should return 400 when password is null', async () => {
      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: null });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'All fields required' });
    });

    it('should return 400 when password is too short (less than 6 chars)', async () => {
      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: 'abc' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    });

    it('should return 400 when password is exactly 5 chars', async () => {
      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: 'abcd' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    });
  });

  describe('Duplicate check', () => {
    it('should return 409 when email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'other-id', email: 'taken@test.com' });

      const req = mockReq({ username: 'newuser', email: 'taken@test.com', password: 'Secure123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email or username already exists',
      });
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'taken@test.com' }, { username: 'newuser' }],
      });
    });

    it('should return 409 when username already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'other-id', username: 'takenuser' });

      const req = mockReq({ username: 'takenuser', email: 'diff@test.com', password: 'Secure123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email or username already exists',
      });
    });
  });

  describe('Success path', () => {
    it('should return 201 with user data and tokens on successful registration', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$2b$10$newhashedpassword');
      User.create.mockResolvedValue(mockUserDoc);

      const req = mockReq({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Secure123!',
      });
      const res = mockRes();
      await authController.register(req, res);

      // Validation
      expect(bcrypt.hash).toHaveBeenCalledWith('Secure123!', 10);
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$newhashedpassword',
      });
      expect(generateToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);

      // Response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: mockUserId,
          username: 'testuser',
          email: 'test@example.com',
          token: mockToken,
          refreshToken: mockRefreshToken,
        },
      });
    });

    it('should accept password of exactly 6 characters', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$2b$10$hashed');
      User.create.mockResolvedValue(mockUserDoc);

      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: '123456' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should hash password with SALT_ROUNDS = 10', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$2b$10$hashed');
      User.create.mockResolvedValue(mockUserDoc);

      const req = mockReq({ username: 'u', email: 'u@t.com', password: 'Password1' });
      const res = mockRes();
      await authController.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 10);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when User.findOne throws', async () => {
      User.findOne.mockRejectedValue(new Error('DB connection failed'));

      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: 'Secure123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DB connection failed',
      });
    });

    it('should return 500 when User.create throws', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$2b$10$hashed');
      User.create.mockRejectedValue(new Error('Validation error'));

      const req = mockReq({ username: 'testuser', email: 'a@b.com', password: 'Secure123!' });
      const res = mockRes();
      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
      });
    });
  });
});

// ============================================================
//  LOGIN
// ============================================================
describe('authController.login', () => {
  describe('Validation', () => {
    it('should return 400 when both fields are missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and password required',
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      const req = mockReq({ password: 'Pass123!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email and password required' });
    });

    it('should return 400 when password is missing', async () => {
      const req = mockReq({ email: 'test@example.com' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email and password required' });
    });

    it('should return 400 when email is empty string', async () => {
      const req = mockReq({ email: '', password: 'Pass123!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email and password required' });
    });

    it('should return 400 when password is empty string', async () => {
      const req = mockReq({ email: 'test@example.com', password: '' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email and password required' });
    });

    it('should return 400 when password is null', async () => {
      const req = mockReq({ email: 'test@example.com', password: null });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email and password required' });
    });
  });

  describe('User not found', () => {
    it('should return 401 when email does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const req = mockReq({ email: 'noone@test.com', password: 'Pass123!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid credentials' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'noone@test.com' });
    });
  });

  describe('Password verification', () => {
    it('should return 401 when password does not match', async () => {
      User.findOne.mockResolvedValue(mockUserDoc);
      bcrypt.compare.mockResolvedValue(false);

      const req = mockReq({ email: 'test@example.com', password: 'WrongPass!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPass!', mockUserDoc.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid credentials' });
    });
  });

  describe('Success path', () => {
    it('should return 200 with user data and tokens on successful login', async () => {
      User.findOne.mockResolvedValue(mockUserDoc);
      bcrypt.compare.mockResolvedValue(true);

      const req = mockReq({ email: 'test@example.com', password: 'CorrectPass!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('CorrectPass!', mockUserDoc.password);
      expect(generateToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);

      expect(res.status).not.toHaveBeenCalled(); // no .status() means 200
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: mockUserId,
          username: 'testuser',
          email: 'test@example.com',
          token: mockToken,
          refreshToken: mockRefreshToken,
        },
      });
    });

    it('should not include password in the response', async () => {
      User.findOne.mockResolvedValue(mockUserDoc);
      bcrypt.compare.mockResolvedValue(true);

      const req = mockReq({ email: 'test@example.com', password: 'CorrectPass!' });
      const res = mockRes();
      await authController.login(req, res);

      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData).not.toHaveProperty('password');
    });
  });

  describe('Error handling', () => {
    it('should return 500 when User.findOne throws', async () => {
      User.findOne.mockRejectedValue(new Error('DB connection lost'));

      const req = mockReq({ email: 'test@example.com', password: 'Pass123!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DB connection lost',
      });
    });

    it('should return 500 when bcrypt.compare throws', async () => {
      User.findOne.mockResolvedValue(mockUserDoc);
      bcrypt.compare.mockRejectedValue(new Error('bcrypt internal error'));

      const req = mockReq({ email: 'test@example.com', password: 'Pass123!' });
      const res = mockRes();
      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'bcrypt internal error',
      });
    });
  });
});

// ============================================================
//  REFRESH TOKEN
// ============================================================
describe('authController.refreshToken', () => {
  describe('Validation', () => {
    it('should return 401 when refreshToken is missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Refresh token required',
      });
    });

    it('should return 401 when refreshToken is empty string', async () => {
      const req = mockReq({ refreshToken: '' });
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Refresh token required' });
    });
  });

  describe('Invalid refresh token', () => {
    it('should return 401 when refresh token is expired', async () => {
      verifyRefreshToken.mockImplementation(() => {
        const err = new Error('jwt expired');
        err.name = 'TokenExpiredError';
        throw err;
      });

      const req = mockReq({ refreshToken: 'expired-token' });
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    });

    it('should return 401 when refresh token is malformed', async () => {
      verifyRefreshToken.mockImplementation(() => {
        const err = new Error('invalid token');
        err.name = 'JsonWebTokenError';
        throw err;
      });

      const req = mockReq({ refreshToken: 'bad.token.here' });
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    });
  });

  describe('User not found', () => {
    it('should return 401 when user no longer exists after token verifies', async () => {
      verifyRefreshToken.mockReturnValue({ userId: mockUserId });
      User.findById.mockResolvedValue(null);

      const req = mockReq({ refreshToken: mockRefreshToken });
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'User not found' });
    });
  });

  describe('Success path', () => {
    it('should return new token and refresh token on success', async () => {
      verifyRefreshToken.mockReturnValue({ userId: mockUserId });
      User.findById.mockResolvedValue(mockUserDoc);

      const req = mockReq({ refreshToken: 'valid-refresh-token' });
      const res = mockRes();
      await authController.refreshToken(req, res);

      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(generateToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { token: mockToken, refreshToken: mockRefreshToken },
      });
    });

    it('should generate a new refresh token (rotate)', async () => {
      verifyRefreshToken.mockReturnValue({ userId: mockUserId });
      User.findById.mockResolvedValue(mockUserDoc);
      generateRefreshToken.mockReturnValue('new-refresh-token');

      const req = mockReq({ refreshToken: 'old-refresh-token' });
      const res = mockRes();
      await authController.refreshToken(req, res);

      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData.refreshToken).toBe('new-refresh-token');
      expect(responseData.refreshToken).not.toBe('old-refresh-token');
    });
  });
});

// ============================================================
//  LOGOUT
// ============================================================
describe('authController.logout', () => {
  it('should return success message', async () => {
    const req = mockReq({});
    const res = mockRes();
    await authController.logout(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

// ============================================================
//  GET PROFILE
// ============================================================
describe('authController.getProfile', () => {
  it('should return user data without password', async () => {
    const safeUser = {
      _id: mockUserId,
      username: 'testuser',
      email: 'test@example.com',
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(safeUser),
    });

    const req = mockReq({});
    const res = mockRes();
    await authController.getProfile(req, res);

    expect(User.findById).toHaveBeenCalledWith(mockUserId);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: safeUser });
  });

  it('should return 404 when user not found', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({});
    const res = mockRes();
    await authController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'User not found' });
  });

  it('should return 500 on database error', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('DB error')),
    });

    const req = mockReq({});
    const res = mockRes();
    await authController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'DB error' });
    });
});