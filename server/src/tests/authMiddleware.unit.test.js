const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

const {
  authMiddleware,
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  JWT_SECRET,
} = require('../middleware/auth');

function mockReq(token) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    userId: undefined,
    body: {},
  };
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

function mockNext() {
  return jest.fn();
}

const mockUserId = '507f1f77bcf86cd799439011';

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
//  AUTH MIDDLEWARE
// ============================================================
describe('authMiddleware', () => {
  describe('Missing token', () => {
    it('should return 401 when authorization header is missing', () => {
      const req = mockReq(null);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is not Bearer', () => {
      const req = mockReq(null);
      req.headers.authorization = 'Basic abc123';
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No token provided',
      });
    });

    it('should return 401 when authorization header is empty string', () => {
      const req = mockReq(null);
      req.headers.authorization = '';
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 when authorization header is undefined', () => {
      const req = mockReq(null);
      req.headers.authorization = undefined;
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Invalid token', () => {
    it('should return 401 when token verification fails with generic error', () => {
      const token = 'bad-token';
      jwt.verify.mockImplementation(() => {
        const err = new Error('invalid token');
        err.name = 'JsonWebTokenError';
        throw err;
      });

      const req = mockReq(token);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      const token = 'expired-token';
      jwt.verify.mockImplementation(() => {
        const err = new Error('jwt expired');
        err.name = 'TokenExpiredError';
        throw err;
      });

      const req = mockReq(token);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
    });

    it('should return 401 when token is malformed', () => {
      const token = 'not.a.token';
      jwt.verify.mockImplementation(() => {
        const err = new Error('jwt malformed');
        err.name = 'JsonWebTokenError';
        throw err;
      });

      const req = mockReq(token);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 when token is an empty string after Bearer', () => {
      const req = mockReq(null);
      req.headers.authorization = 'Bearer ';
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Valid token', () => {
    it('should set userId on req and call next', () => {
      const token = 'valid-token';
      jwt.verify.mockReturnValue({ userId: mockUserId, iat: 1, exp: 999 });

      const req = mockReq(token);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(req.userId).toBe(mockUserId);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should extract only the token part after "Bearer "', () => {
      const token = 'my-jwt-token-abc123';
      jwt.verify.mockReturnValue({ userId: 'user-123' });

      const req = mockReq(token);
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('my-jwt-token-abc123', expect.any(String));
      expect(req.userId).toBe('user-123');
    });

    it('should not modify other req properties', () => {
      const token = 'valid-token';
      jwt.verify.mockReturnValue({ userId: mockUserId });

      const req = mockReq(token);
      req.query = { page: '1' };
      req.params = { id: 'abc' };
      const res = mockRes();
      const next = mockNext();

      authMiddleware(req, res, next);

      expect(req.query).toEqual({ page: '1' });
      expect(req.params).toEqual({ id: 'abc' });
    });
  });
});

// ============================================================
//  GENERATE TOKEN
// ============================================================
describe('generateToken', () => {
  it('should call jwt.sign with userId, secret, and expiry', () => {
    jwt.sign.mockReturnValue('signed-token');

    const token = generateToken(mockUserId);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUserId },
      expect.any(String),
      { expiresIn: expect.any(String) }
    );
    expect(token).toBe('signed-token');
  });

  it('should return the signed JWT string', () => {
    jwt.sign.mockReturnValue('my-returned-token');
    expect(generateToken('user-123')).toBe('my-returned-token');
  });
});

// ============================================================
//  VERIFY TOKEN
// ============================================================
describe('verifyToken', () => {
  it('should call jwt.verify with the token and secret', () => {
    jwt.verify.mockReturnValue({ userId: mockUserId, exp: 123 });
    const result = verifyToken('some-token');

    expect(jwt.verify).toHaveBeenCalledWith('some-token', expect.any(String));
    expect(result).toEqual({ userId: mockUserId, exp: 123 });
  });

  it('should throw when token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      const e = new Error('invalid');
      e.name = 'JsonWebTokenError';
      throw e;
    });

    expect(() => verifyToken('bad')).toThrow('invalid');
  });
});

// ============================================================
//  GENERATE REFRESH TOKEN
// ============================================================
describe('generateRefreshToken', () => {
  it('should call jwt.sign with userId and refresh secret', () => {
    jwt.sign.mockReturnValue('refresh-signed');

    const token = generateRefreshToken(mockUserId);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUserId },
      expect.any(String),
      { expiresIn: expect.any(String) }
    );
    expect(token).toBe('refresh-signed');
  });
});

// ============================================================
//  VERIFY REFRESH TOKEN
// ============================================================
describe('verifyRefreshToken', () => {
  it('should call jwt.verify with the token and refresh secret', () => {
    jwt.verify.mockReturnValue({ userId: mockUserId, exp: 123 });
    const result = verifyRefreshToken('refresh-token');

    expect(jwt.verify).toHaveBeenCalledWith('refresh-token', expect.any(String));
    expect(result).toEqual({ userId: mockUserId, exp: 123 });
  });

  it('should throw when refresh token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error('invalid refresh');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    expect(() => verifyRefreshToken('bad-refresh')).toThrow('invalid refresh');
  });
});

// ============================================================
//  JWT_SECRET EXPORT
// ============================================================
describe('JWT_SECRET', () => {
  it('should export a default JWT secret', () => {
    expect(JWT_SECRET).toBe('muonline-secret-key');
  });
});