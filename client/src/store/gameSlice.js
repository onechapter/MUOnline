import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  player: null,
  monsters: [],
  npcs: [],
  itemsOnGround: [],
  otherPlayers: [],
  chatMessages: [],
  currentMap: 'lorencia',
  playerPosition: { x: 128, y: 0, z: 128 },
  playerHP: 100,
  playerMaxHP: 100,
  playerMP: 50,
  playerMaxMP: 50,
  playerExp: 0,
  playerLevel: 1,
  playerGold: 0,
  inventory: [],
  equipment: {},
  stats: {},
  connected: false,
  shopOpen: null,
  selectedMonster: null,
  buffs: [],
  notifications: [],
  // Phase 2: Party/Guild/Trade state
  party: null,
  partyMembers: [],
  guild: null,
  guildMembers: [],
  pendingPartyInvite: null,
  pendingGuildInvite: null,
  activeTrade: null,
  tradePartner: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayer: (state, action) => {
      state.player = action.payload;
      if (action.payload) {
        state.playerHP = action.payload.currentHP || 100;
        state.playerMaxHP = action.payload.maxHP || 100;
        state.playerMP = action.payload.currentMP || 50;
        state.playerMaxMP = action.payload.maxMP || 50;
        state.playerExp = action.payload.experience || 0;
        state.playerLevel = action.payload.level || 1;
        state.playerGold = action.payload.gold || 0;
        state.inventory = action.payload.inventory || [];
        state.equipment = action.payload.equipment || {};
        state.stats = action.payload.stats || {};
      }
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setMonsters: (state, action) => {
      state.monsters = action.payload;
    },
    setNPCs: (state, action) => {
      state.npcs = action.payload;
    },
    setItemsOnGround: (state, action) => {
      state.itemsOnGround = action.payload;
    },
    setOtherPlayers: (state, action) => {
      state.otherPlayers = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
      if (state.chatMessages.length > 100) {
        state.chatMessages.shift();
      }
    },
    updatePlayerHP: (state, action) => {
      state.playerHP = action.payload;
    },
    updatePlayerMP: (state, action) => {
      state.playerMP = action.payload;
    },
    updatePlayerPosition: (state, action) => {
      state.playerPosition = action.payload;
    },
    levelUp: (state, action) => {
      state.playerLevel = action.payload.level;
      state.playerExp = action.payload.exp;
      state.playerMaxHP = action.payload.maxHP;
      state.playerMaxMP = action.payload.maxMP;
      state.playerHP = action.payload.maxHP;
      state.playerMP = action.payload.maxMP;
    },
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    addItem: (state, action) => {
      if (state.inventory.length < 64) {
        state.inventory.push(action.payload);
      }
    },
    removeItem: (state, action) => {
      state.inventory.splice(action.payload, 1);
    },
    setEquipment: (state, action) => {
      state.equipment = action.payload;
    },
    equipItem: (state, action) => {
      const { slot, item, inventoryIndex } = action.payload;
      if (item) {
        state.equipment[slot] = item;
        if (inventoryIndex !== undefined) {
          state.inventory.splice(inventoryIndex, 1);
        }
      } else {
        delete state.equipment[slot];
      }
    },
    setShop: (state, action) => {
      state.shopOpen = action.payload;
    },
    setSelectedMonster: (state, action) => {
      state.selectedMonster = action.payload;
    },
    updateStats: (state, action) => {
      state.stats = action.payload;
    },
    addGold: (state, action) => {
      state.playerGold += action.payload;
    },
    setBuffs: (state, action) => {
      state.buffs = action.payload;
    },
    setCurrentMap: (state, action) => {
      state.currentMap = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    // Phase 2: Party/Guild/Trade reducers
    setParty: (state, action) => {
      state.party = action.payload;
    },
    setPartyMembers: (state, action) => {
      state.partyMembers = action.payload;
    },
    addPartyMember: (state, action) => {
      state.partyMembers.push(action.payload);
    },
    removePartyMember: (state, action) => {
      state.partyMembers = state.partyMembers.filter(
        (m) => m.id !== action.payload
      );
    },
    setPendingPartyInvite: (state, action) => {
      state.pendingPartyInvite = action.payload;
    },
    setGuild: (state, action) => {
      state.guild = action.payload;
    },
    setGuildMembers: (state, action) => {
      state.guildMembers = action.payload;
    },
    addGuildMember: (state, action) => {
      state.guildMembers.push(action.payload);
    },
    removeGuildMember: (state, action) => {
      state.guildMembers = state.guildMembers.filter(
        (m) => m.id !== action.payload
      );
    },
    setPendingGuildInvite: (state, action) => {
      state.pendingGuildInvite = action.payload;
    },
    setActiveTrade: (state, action) => {
      state.activeTrade = action.payload;
    },
    setTradePartner: (state, action) => {
      state.tradePartner = action.payload;
    },
    clearTrade: (state) => {
      state.activeTrade = null;
      state.tradePartner = null;
    },
    updatePlayerGold: (state, action) => {
      state.playerGold = action.payload;
    },
  },
});

export const {
  setPlayer,
  setConnected,
  setMonsters,
  setNPCs,
  setItemsOnGround,
  setOtherPlayers,
  addChatMessage,
  updatePlayerHP,
  updatePlayerMP,
  updatePlayerPosition,
  levelUp,
  setInventory,
  addItem,
  removeItem,
  setEquipment,
  equipItem,
  setShop,
  setSelectedMonster,
  updateStats,
  addGold,
  updatePlayerGold,
  setBuffs,
  setCurrentMap,
  addNotification,
  removeNotification,
  // Phase 2 exports
  setParty,
  setPartyMembers,
  addPartyMember,
  removePartyMember,
  setPendingPartyInvite,
  setGuild,
  setGuildMembers,
  addGuildMember,
  removeGuildMember,
  setPendingGuildInvite,
  setActiveTrade,
  setTradePartner,
  clearTrade,
} = gameSlice.actions;

export default gameSlice.reducer;