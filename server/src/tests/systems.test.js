const TradingSystem = require('../game/systems/TradingSystem');
const PvPSystem = require('../game/systems/PvPSystem');
const BossSystem = require('../game/systems/BossSystem');

describe('TradingSystem', () => {
  beforeEach(() => {
    TradingSystem.cancelTrade('player1');
    TradingSystem.cancelTrade('player2');
  });

  test('creates trade request', () => {
    const result = TradingSystem.createTradeRequest('player1', 'player2');
    expect(result.success).toBe(true);
  });

  test('rejects trade when already in trade', () => {
    TradingSystem.acceptTrade('player1', 'player2');
    const result = TradingSystem.createTradeRequest('player1', 'player3');
    expect(result.success).toBe(false);
  });

  test('accepts trade', () => {
    const result = TradingSystem.acceptTrade('player1', 'player2');
    expect(result.success).toBe(true);
    expect(result.trade.player1.id).toBe('player1');
    expect(result.trade.player2.id).toBe('player2');
  });

  test('adds item to trade', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const playerData = { inventory: [{ itemId: 'sword', name: 'Sword' }] };
    const result = TradingSystem.addItemToTrade('player1', trade.trade, playerData, 0);
    expect(result.success).toBe(true);
    expect(result.trade.player1.items.length).toBe(1);
  });

  test('rejects duplicate item in trade', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const playerData = { inventory: [{ itemId: 'sword', name: 'Sword' }] };
    TradingSystem.addItemToTrade('player1', trade.trade, playerData, 0);
    const result = TradingSystem.addItemToTrade('player1', trade.trade, playerData, 0);
    expect(result.success).toBe(false);
  });

  test('adds gold to trade', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const playerData = { gold: 5000 };
    const result = TradingSystem.addGoldToTrade('player1', trade.trade, playerData, 2000);
    expect(result.success).toBe(true);
    expect(result.trade.player1.gold).toBe(2000);
  });

  test('rejects gold exceeding player gold', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const playerData = { gold: 1000 };
    const result = TradingSystem.addGoldToTrade('player1', trade.trade, playerData, 2000);
    expect(result.success).toBe(false);
  });

  test('sets player ready', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    TradingSystem.setReady('player1', trade.trade);
    expect(trade.trade.ready.player1).toBe(true);
  });

  test('executes trade successfully', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const player1 = {
      inventory: [{ itemId: 'sword', name: 'Sword' }],
      gold: 5000,
    };
    const player2 = {
      inventory: [{ itemId: 'shield', name: 'Shield' }],
      gold: 3000,
    };
    trade.trade.player1.items = [{ ...player1.inventory[0], sourceIndex: 0 }];
    trade.trade.player2.items = [{ ...player2.inventory[0], sourceIndex: 0 }];
    trade.trade.player1.gold = 1000;
    trade.trade.player2.gold = 2000;
    trade.trade.ready.player1 = true;
    trade.trade.ready.player2 = true;

    const result = TradingSystem.executeTrade(trade.trade, player1, player2);
    expect(result.success).toBe(true);
    expect(result.player1Gold).toBe(6000);
    expect(result.player2Gold).toBeGreaterThan(0);
  });

  test('fails trade when not both ready', () => {
    const trade = TradingSystem.acceptTrade('player1', 'player2');
    const player1 = { inventory: [], gold: 0 };
    const player2 = { inventory: [], gold: 0 };
    const result = TradingSystem.executeTrade(trade.trade, player1, player2);
    expect(result.success).toBe(false);
  });

  test('cancels trade', () => {
    TradingSystem.acceptTrade('player1', 'player2');
    TradingSystem.cancelTrade('player1');
    const trade = TradingSystem.getTrade('player1');
    expect(trade).toBeNull();
  });
});

describe('PvPSystem', () => {
  beforeEach(() => {
    PvPSystem.cancelTrade?.();
  });

  test('requests duel', () => {
    const result = PvPSystem.requestDuel('player1', 'player2');
    expect(result.success).toBe(true);
  });

  test('rejects duel when already dueling', () => {
    const world = { getPlayer: (id) => ({ id, name: id, currentHP: 100, maxHP: 100, stats: { strength: 10 } }) };
    PvPSystem.acceptDuel('player1', 'player2', world);
    const result = PvPSystem.requestDuel('player1', 'player3');
    expect(result.success).toBe(false);
  });

  test('accepts duel', () => {
    const world = { getPlayer: (id) => ({ id, name: id, currentHP: 100, maxHP: 100, stats: { strength: 10 } }) };
    const result = PvPSystem.acceptDuel('player1', 'player2', world);
    expect(result.success).toBe(true);
    expect(result.duel.challengerId).toBe('player1');
  });

  test('duel attack deals damage', () => {
    const world = {
      getPlayer: (id) => ({
        id,
        name: id,
        currentHP: 100,
        maxHP: 100,
        stats: { strength: 60 },
        equipment: { weapon: { damage: 20 } },
      }),
    };
    PvPSystem.acceptDuel('player1', 'player2', world);
    const result = PvPSystem.duelAttack(world, 'player1', 'player2');
    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });

  test('rejects attack outside duel', () => {
    const world = { getPlayer: () => null };
    const result = PvPSystem.duelAttack(world, 'player1', 'player2');
    expect(result.success).toBe(false);
  });

  test('forfeits duel', () => {
    const world = { getPlayer: (id) => ({ id, name: id, currentHP: 100, maxHP: 100, stats: { strength: 10 } }) };
    PvPSystem.acceptDuel('player1', 'player2', world);
    const result = PvPSystem.forfeitDuel('player1');
    expect(result.success).toBe(true);
    expect(result.winner).toBe('player2');
  });

  test('sets PK flag', () => {
    const result = PvPSystem.setPKFlag('player1', true);
    expect(result.success).toBe(true);
    const flag = PvPSystem.getPKFlag('player1');
    expect(flag.count).toBe(1);
  });

  test('clears PK flag', () => {
    PvPSystem.setPKFlag('player1', true);
    PvPSystem.setPKFlag('player1', false);
    const flag = PvPSystem.getPKFlag('player1');
    expect(flag).toBeNull();
  });

  test('player kill applies penalty', () => {
    const world = {
      getPlayer: (id) => ({
        id,
        name: id,
        currentHP: 100,
        maxHP: 100,
        gold: 10000,
        position: { x: 0, y: 0, z: 0, mapId: 'lorencia' },
        stats: { strength: 10 },
        equipment: {},
      }),
    };
    const result = PvPSystem.playerKill(world, 'killer', 'victim');
    expect(result.success).toBe(true);
    expect(result.penaltyGold).toBe(1000);
  });
});

describe('BossSystem', () => {
  test('has boss templates', () => {
    expect(BossSystem.bossTemplates.length).toBeGreaterThan(0);
    expect(BossSystem.bossTemplates[0].bossId).toBeDefined();
    expect(BossSystem.bossTemplates[0].hp).toBeGreaterThan(0);
  });

  test('calculates special damage', () => {
    const boss = { attack: 100 };
    const result = BossSystem.calculateSpecialDamage(boss, {}, 'fire_breath');
    expect(result).toBeGreaterThan(0);
  });

  test('checks phase transition', () => {
    const boss = { currentHP: 10000, hp: 20000 };
    expect(BossSystem.checkPhaseTransition(boss)).toBe(2);
    boss.currentHP = 4000;
    expect(BossSystem.checkPhaseTransition(boss)).toBe(3);
    boss.currentHP = 15000;
    expect(BossSystem.checkPhaseTransition(boss)).toBe(1);
  });

  test('gets all active bosses (empty)', () => {
    const bosses = BossSystem.getAllActiveBosses();
    expect(Array.isArray(bosses)).toBe(true);
  });

  test('schedules boss', () => {
    const world = {
      spawnSystem: { monsters: new Map() },
      dropItemOnGround: () => {},
    };
    const result = BossSystem.scheduleBoss('dragon', world);
    expect(result.success).toBe(true);
  });

  test('rejects duplicate boss schedule', () => {
    const world = {
      spawnSystem: { monsters: new Map() },
      dropItemOnGround: () => {},
    };
    BossSystem.scheduleBoss('demon', world);
    const result = BossSystem.scheduleBoss('demon', world);
    expect(result.success).toBe(false);
  });

  test('rejects unknown boss', () => {
    const result = BossSystem.scheduleBoss('nonexistent', {});
    expect(result.success).toBe(false);
  });
});