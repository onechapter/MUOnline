# 🧪 TESTING GUIDELINES - GAME MMORPG PROJECT

> **Mục đích**: Hướng dẫn chi tiết cho agent về cách viết unit tests và integration tests đạt chuẩn cho mỗi Phase

---

## 📚 TABLE OF CONTENTS

1. [Testing Frameworks Setup](#testing-frameworks-setup)
2. [Unit Testing Guidelines](#unit-testing-guidelines)
3. [Integration Testing Guidelines](#integration-testing-guidelines)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Testing Examples by Phase](#testing-examples-by-phase)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)

---

## 🛠️ TESTING FRAMEWORKS SETUP

### Backend Testing Stack
```bash
npm install --save-dev jest supertest mongodb-memory-server
npm install --save-dev @types/jest @types/supertest
```

### Frontend Testing Stack
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

### package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## ✅ UNIT TESTING GUIDELINES

### Rule 1: Test Naming Convention
```javascript
// ❌ Bad
test('it works', () => {});

// ✅ Good
test('should return user object when login with valid credentials', () => {});
```

### Rule 2: AAA Pattern (Arrange, Act, Assert)
```javascript
test('should calculate damage correctly', () => {
  // Arrange - Setup test data
  const character = { strength: 100, weaponDamage: 50 };
  const expectedDamage = (100 / 6) + 50; // ~66.67
  
  // Act - Execute the function
  const actualDamage = calculateDamage(character);
  
  // Assert - Verify the result
  expect(actualDamage).toBeCloseTo(expectedDamage, 2);
});
```

### Rule 3: Test One Thing Per Test
```javascript
// ❌ Bad - Testing multiple things
test('user auth system', () => {
  expect(register()).toBeTruthy();
  expect(login()).toBeTruthy();
  expect(logout()).toBeTruthy();
});

// ✅ Good - Separate tests
test('should register user successfully', () => {
  expect(register(validUser)).toBeTruthy();
});

test('should login user with correct credentials', () => {
  expect(login(username, password)).toBeTruthy();
});

test('should logout user and clear session', () => {
  expect(logout()).toBeTruthy();
  expect(getSession()).toBeNull();
});
```

### Rule 4: Mock External Dependencies
```javascript
// Mock database calls
jest.mock('../models/User');

test('should create character in database', async () => {
  // Arrange
  const mockSave = jest.fn().mockResolvedValue({ id: '123', name: 'TestChar' });
  Character.prototype.save = mockSave;
  
  // Act
  const character = await createCharacter({ name: 'TestChar', class: 'Knight' });
  
  // Assert
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(character.name).toBe('TestChar');
});
```

---

## 🔗 INTEGRATION TESTING GUIDELINES

### Rule 1: Use In-Memory Database
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

### Rule 2: Test Full User Flows
```javascript
describe('Authentication Flow', () => {
  test('should complete full auth flow: register -> login -> access protected route', async () => {
    // Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
    expect(registerRes.status).toBe(201);
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    
    const token = loginRes.body.token;
    
    // Access protected route
    const profileRes = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe('test@example.com');
  });
});
```

---

## 📊 TEST COVERAGE REQUIREMENTS

### Minimum Coverage by Category

| Category | Minimum Coverage | Why |
|----------|------------------|-----|
| **Authentication** | 100% | Critical security |
| **Payment/Economy** | 100% | Financial integrity |
| **Combat System** | 90% | Core gameplay |
| **Item System** | 90% | Core gameplay |
| **Trading** | 100% | Prevent exploits |
| **Social Features** | 80% | Important but not critical |
| **UI Components** | 70% | Visual, less critical |
| **Utils/Helpers** | 80% | Support functions |

### How to Check Coverage
```bash
npm run test:coverage
```

Output example:
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.32 |    78.45 |   89.12 |   86.23 |
 auth/                |   100   |    100   |   100   |   100   |
  authController.js   |   100   |    100   |   100   |   100   |
  authMiddleware.js   |   100   |    100   |   100   |   100   |
 combat/              |   92.15 |    85.67 |   94.23 |   91.89 |
  combatSystem.js     |   92.15 |    85.67 |   94.23 |   91.89 |
----------------------|---------|----------|---------|---------|
```

---

## 📝 TESTING EXAMPLES BY PHASE

### PHASE 1: AUTHENTICATION TESTS

#### File: `server/tests/unit/auth.test.js`
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { register, login, verifyToken } = require('../../controllers/authController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Authentication Unit Tests', () => {
  describe('register()', () => {
    test('should hash password before saving', async () => {
      const mockUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.mockImplementation(() => mockUser);
      
      await register({ username: 'testuser', email: 'test@example.com', password: 'Password123!' });
      
      expect(mockUser.password).not.toBe('Password123!');
      expect(await bcrypt.compare('Password123!', mockUser.password)).toBe(true);
    });
    
    test('should reject weak passwords', async () => {
      const result = await register({ username: 'test', email: 'test@example.com', password: '123' });
      expect(result.error).toBe('Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number');
    });
    
    test('should reject duplicate email', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });
      
      const result = await register({ username: 'test', email: 'test@example.com', password: 'Password123!' });
      expect(result.error).toBe('Email already exists');
    });
  });
  
  describe('login()', () => {
    test('should return JWT token on successful login', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        password: hashedPassword
      });
      
      const result = await login({ email: 'test@example.com', password: 'Password123!' });
      
      expect(result.token).toBeDefined();
      expect(jwt.verify(result.token, process.env.JWT_SECRET)).toBeTruthy();
    });
    
    test('should reject incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      User.findOne = jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: hashedPassword
      });
      
      const result = await login({ email: 'test@example.com', password: 'WrongPassword' });
      expect(result.error).toBe('Invalid credentials');
    });
    
    test('should reject non-existent user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      
      const result = await login({ email: 'notfound@example.com', password: 'Password123!' });
      expect(result.error).toBe('Invalid credentials');
    });
  });
});
```

#### File: `server/tests/integration/auth.integration.test.js`
```javascript
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Authentication Integration Tests', () => {
  test('Complete auth flow: register -> login -> access protected route', async () => {
    // Step 1: Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'integrationtest',
        email: 'integration@test.com',
        password: 'TestPass123!'
      });
    
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.message).toBe('User registered successfully');
    
    // Step 2: Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'TestPass123!'
      });
    
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    
    const token = loginRes.body.token;
    
    // Step 3: Access protected route
    const profileRes = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
    
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe('integration@test.com');
  });
  
  test('Should reject access to protected route without token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });
});
```

---

### PHASE 2: COMBAT TESTS

#### File: `server/tests/unit/combat.test.js`
```javascript
const { calculateDamage, calculateDefenseReduction, checkCriticalHit } = require('../../game/systems/CombatSystem');

describe('Combat System Unit Tests', () => {
  describe('calculateDamage()', () => {
    test('should calculate physical damage correctly', () => {
      const attacker = { strength: 120, weaponDamage: 50 };
      const expectedDamage = (120 / 6) + 50; // 20 + 50 = 70
      
      const damage = calculateDamage(attacker);
      expect(damage).toBeCloseTo(70, 2);
    });
    
    test('should include enhancement bonus', () => {
      const attacker = { strength: 100, weaponDamage: 50, enhancementLevel: 5 };
      const baseDamage = (100 / 6) + 50;
      const expectedDamage = baseDamage * (1 + 0.05 * 5); // +5% per level
      
      const damage = calculateDamage(attacker);
      expect(damage).toBeCloseTo(expectedDamage, 2);
    });
  });
  
  describe('calculateDefenseReduction()', () => {
    test('should reduce damage based on defense formula', () => {
      const baseDamage = 100;
      const defense = 100;
      const expectedDamage = 100 * (1 - 100 / (100 + 100)); // 100 * 0.5 = 50
      
      const finalDamage = calculateDefenseReduction(baseDamage, defense);
      expect(finalDamage).toBeCloseTo(50, 2);
    });
    
    test('should not allow negative damage', () => {
      const baseDamage = 10;
      const defense = 10000;
      
      const finalDamage = calculateDefenseReduction(baseDamage, defense);
      expect(finalDamage).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('checkCriticalHit()', () => {
    test('should return critical damage when random triggers', () => {
      const damage = 100;
      const agility = 300; // 300/30 = 10% crit chance
      
      jest.spyOn(Math, 'random').mockReturnValue(0.05); // 5% < 10%
      
      const result = checkCriticalHit(damage, agility);
      expect(result).toBeCloseTo(150, 2); // 1.5x damage
      
      Math.random.mockRestore();
    });
    
    test('should return normal damage when random does not trigger', () => {
      const damage = 100;
      const agility = 300;
      
      jest.spyOn(Math, 'random').mockReturnValue(0.15); // 15% > 10%
      
      const result = checkCriticalHit(damage, agility);
      expect(result).toBe(100);
      
      Math.random.mockRestore();
    });
  });
});
```

---

### PHASE 3: INVENTORY TESTS

#### File: `client/src/tests/unit/Inventory.test.js`
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Inventory from '../../components/UI/Inventory';
import { InventoryProvider } from '../../contexts/InventoryContext';

describe('Inventory Component', () => {
  test('should render 8x8 grid', () => {
    render(
      <InventoryProvider>
        <Inventory />
      </InventoryProvider>
    );
    
    const slots = screen.getAllByTestId('inventory-slot');
    expect(slots).toHaveLength(64); // 8x8
  });
  
  test('should add item to inventory', () => {
    const { getByTestId } = render(
      <InventoryProvider>
        <Inventory />
      </InventoryProvider>
    );
    
    const item = { id: '1', name: 'Sword', icon: 'sword.png' };
    
    // Simulate adding item
    fireEvent.click(getByTestId('add-item-button'));
    
    expect(screen.getByAltText('Sword')).toBeInTheDocument();
  });
  
  test('should not allow adding item when inventory full', () => {
    // Fill inventory with 64 items
    const fullInventory = Array(64).fill({ id: 'item', name: 'Item' });
    
    const { getByText } = render(
      <InventoryProvider initialInventory={fullInventory}>
        <Inventory />
      </InventoryProvider>
    );
    
    fireEvent.click(getByTestId('add-item-button'));
    
    expect(getByText('Inventory is full')).toBeInTheDocument();
  });
});
```

---

## 🎯 BEST PRACTICES

### 1. Test File Organization
```
tests/
├── unit/
│   ├── auth/
│   │   ├── authController.test.js
│   │   └── authMiddleware.test.js
│   ├── combat/
│   │   └── combatSystem.test.js
│   └── inventory/
│       └── inventorySystem.test.js
├── integration/
│   ├── auth.integration.test.js
│   ├── character.integration.test.js
│   └── combat.integration.test.js
└── e2e/
    └── fullGameFlow.e2e.test.js
```

### 2. Use Descriptive Test Names
```javascript
// ❌ Bad
test('damage', () => {});

// ✅ Good
test('should calculate 150% damage on critical hit', () => {});
```

### 3. Test Edge Cases
```javascript
test('should handle divide by zero in damage calculation', () => {
  const attacker = { strength: 0, weaponDamage: 0 };
  const damage = calculateDamage(attacker);
  expect(damage).toBeGreaterThanOrEqual(1); // Minimum 1 damage
});
```

### 4. Use Test Fixtures
```javascript
// fixtures/characters.js
module.exports = {
  knight: {
    name: 'TestKnight',
    class: 'Dark Knight',
    level: 1,
    stats: { strength: 100, agility: 50, vitality: 80, energy: 20 }
  },
  wizard: {
    name: 'TestWizard',
    class: 'Dark Wizard',
    level: 1,
    stats: { strength: 20, agility: 30, vitality: 50, energy: 150 }
  }
};

// In test file
const { knight, wizard } = require('../fixtures/characters');

test('knight should deal more physical damage than wizard', () => {
  const knightDamage = calculateDamage(knight);
  const wizardDamage = calculateDamage(wizard);
  expect(knightDamage).toBeGreaterThan(wizardDamage);
});
```

### 5. Clean Up After Tests
```javascript
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```

---

## ⚠️ COMMON PITFALLS

### 1. Testing Implementation Details
```javascript
// ❌ Bad - Testing internal state
test('should set isLoading to true', () => {
  const component = render(<LoginForm />);
  expect(component.state.isLoading).toBe(true);
});

// ✅ Good - Testing behavior
test('should show loading spinner when submitting', () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByText('Login'));
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});
```

### 2. Not Cleaning Up
```javascript
// ❌ Bad
test('test 1', () => {
  const user = createUser();
  // user still exists in DB
});

// ✅ Good
afterEach(async () => {
  await User.deleteMany({});
});
```

### 3. Flaky Tests (Random Failures)
```javascript
// ❌ Bad - Depends on timing
test('should update after 1 second', async () => {
  updateAsync();
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(value).toBe(10);
});

// ✅ Good - Wait for specific condition
test('should update after async operation', async () => {
  await updateAsync();
  await waitFor(() => expect(value).toBe(10));
});
```

---

## 📈 MEASURING SUCCESS

### Test Quality Checklist
- [ ] All tests have clear, descriptive names
- [ ] Tests are independent (can run in any order)
- [ ] No hard-coded values (use constants/fixtures)
- [ ] Edge cases covered
- [ ] Error cases covered
- [ ] Happy path covered
- [ ] Mocks used for external dependencies
- [ ] Tests run fast (<5 seconds for unit tests)
- [ ] No console.log in tests
- [ ] Coverage meets thresholds

### When to Write Tests
- **Before coding** (TDD): Write test first, then implement
- **During coding**: Write test alongside implementation
- **After coding**: Write test after implementation (minimum acceptable)

### Test Pyramid
```
    /\
   /  \    E2E Tests (10%)
  /____\
 /      \   Integration Tests (30%)
/________\  Unit Tests (60%)
```

---

## 🚀 AGENT TESTING WORKFLOW

### For Each Feature Implementation:

1. **Write Test Cases First**
   ```javascript
   describe('Feature X', () => {
     test('should do Y when Z', () => {
       // TODO: implement
     });
   });
   ```

2. **Implement the Feature**
   ```javascript
   function featureX() {
     // implementation
   }
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Check Coverage**
   ```bash
   npm run test:coverage
   ```

5. **Refactor if Coverage < 80%**

6. **Mark Task as Complete** in checklist

---

**🎯 Remember: Good tests are documentation that never goes out of date! 🎯**
