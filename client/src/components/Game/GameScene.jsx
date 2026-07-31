import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import { connectSocket, on, emit } from '../../network/SocketManager';
import {
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
  setInventory,
  setEquipment,
  setShop,
  addGold,
  setCurrentMap,
  updateStats,
  levelUp,
  addNotification,
} from '../../store/gameSlice';
import Scene3D from './Scene3D';
import HUD from './HUD';
import InventoryPanel from './InventoryPanel';
import StatsPanel from './StatsPanel';
import ShopPanel from './ShopPanel';
import SkillHotbar from './SkillHotbar';
import PartyPanel from './PartyPanel';
import MapSelector from './MapSelector';
import GuildPanel from './GuildPanel';
import EnhancementPanel from './EnhancementPanel';
import TradingPanel from './TradingPanel';
import SettingsPanel from './SettingsPanel';
import SkillTreePanel from './SkillTreePanel';
import Minimap from './Minimap';
import Notifications from './Notifications';
import LoadingScreen from './LoadingScreen';
import './Game.css';

export default function GameScene() {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);
  const auth = useSelector((state) => state.auth);
  const [chatInput, setChatInput] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [showTrading, setShowTrading] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const keysDown = useRef(new Set());

  useEffect(() => {
    if (!auth.token) return;
    setLoading(true);
    const characterId = localStorage.getItem('selectedCharacter');
    const socket = connectSocket(auth.token, characterId);
    socket.emit('auth:login');

    const unsubs = [];
    unsubs.push(on('auth:success', (data) => {
      dispatch(setPlayer(data.player));
      dispatch(setConnected(true));
      if (data.nearbyMonsters) dispatch(setMonsters(data.nearbyMonsters));
      if (data.nearbyNPCs) dispatch(setNPCs(data.nearbyNPCs));
      if (data.nearbyItems) dispatch(setItemsOnGround(data.nearbyItems));
      if (data.nearbyPlayers) dispatch(setOtherPlayers(data.nearbyPlayers));
      if (data.player?.inventory) dispatch(setInventory(data.player.inventory));
      if (data.player?.equipment) dispatch(setEquipment(data.player.equipment));
      if (data.player?.position) dispatch(updatePlayerPosition(data.player.position));
      setLoading(false);
    }));
    unsubs.push(on('move:confirm', (d) => dispatch(updatePlayerPosition(d.position))));
    unsubs.push(on('world:monsters', (d) => dispatch(setMonsters(d.monsters))));
    unsubs.push(on('world:npcs', (d) => dispatch(setNPCs(d.npcs))));
    unsubs.push(on('world:items', (d) => dispatch(setItemsOnGround(d.items))));
    unsubs.push(on('player:damage', (d) => {
      dispatch(updatePlayerHP(d.playerHP));
      if (d.damage) dispatch(addNotification({ id: Date.now(), message: `Took ${d.damage} damage!`, type: 'error' }));
    }));
    unsubs.push(on('attack:result', (d) => {
      if (d.success) {
        dispatch(addNotification({ id: Date.now(), message: `Hit for ${d.damage} damage!`, type: 'success' }));
      } else {
        dispatch(addNotification({ id: Date.now(), message: d.error || 'Attack failed', type: 'error' }));
      }
    }));
    unsubs.push(on('monster:dead', (d) => {
      dispatch(setMonsters(game.monsters?.filter(m => m.instanceId !== d.targetId) || []));
      if (d.drops) {
        for (const drop of d.drops) {
          if (drop.type === 'gold') {
            dispatch(addGold(drop.amount));
            dispatch(addNotification({ id: Date.now() + (drop.index || 0), message: `+${drop.amount} gold!`, type: 'success' }));
          }
        }
      }
      if (d.exp) dispatch(addNotification({ id: Date.now() + 99, message: `+${d.exp} exp!`, type: 'success' }));
    }));
    unsubs.push(on('monster:damage', (d) => {
      dispatch(setMonsters((game.monsters || []).map(m =>
        m.instanceId === d.targetId ? { ...m, currentHP: d.hp } : m
      )));
    }));
    unsubs.push(on('level:up', (d) => {
      dispatch(levelUp(d));
      dispatch(addNotification({ id: Date.now(), message: `Level up! You are now level ${d.level}!`, type: 'levelup' }));
    }));
    unsubs.push(on('chat:message', (d) => dispatch(addChatMessage(d))));
    unsubs.push(on('inventory:result', (d) => dispatch(setInventory(d.inventory))));
    unsubs.push(on('equip:result', (d) => dispatch(setEquipment(d.equipment))));
    unsubs.push(on('npc:result', (d) => { if (d.type === 'shop') dispatch(setShop(d)); }));
    unsubs.push(on('skill:result', (d) => {
      if (d.currentMP !== undefined) dispatch(updatePlayerMP(d.currentMP));
      if (d.message) dispatch(addNotification({ id: Date.now(), message: d.message, type: 'info' }));
    }));
    unsubs.push(on('map:changed', (d) => {
      dispatch(updatePlayerPosition(d.position));
      dispatch(setCurrentMap(d.position.mapId));
      dispatch(addNotification({ id: Date.now(), message: `Teleported to ${d.position.mapId}`, type: 'success' }));
    }));
    unsubs.push(on('disconnect', () => {
      dispatch(setConnected(false));
      dispatch(addNotification({ id: Date.now(), message: 'Disconnected from server', type: 'error' }));
    }));
    unsubs.push(on('stats:result', (d) => dispatch(updateStats(d.stats))));
    unsubs.push(on('trade:success', (d) => dispatch(addNotification({ id: Date.now(), message: d.message || 'Trade complete!', type: 'success' }))));
    unsubs.push(on('enhance:result', (d) => {
      if (d.success) {
        dispatch(addNotification({ id: Date.now(), message: `Enhancement to +${d.enhancementLevel}!`, type: 'success' }));
      } else {
        dispatch(addNotification({ id: Date.now(), message: d.message || 'Enhancement failed!', type: 'error' }));
      }
    }));

    dispatch(setConnected(true));

    return () => { unsubs.forEach((fn) => fn?.()); };
  }, [auth.token, dispatch]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'i' || e.key === 'I') setShowInventory((v) => !v);
      if (e.key === 'c' || e.key === 'C') setShowStats((v) => !v);
      if (e.key === 'Enter') setChatVisible((v) => !v);
      if (e.key === 'p' || e.key === 'P') setShowParty((v) => !v);
      if (e.key === 'm' || e.key === 'M') setShowMap((v) => !v);
      if (e.key === 'g' || e.key === 'G') setShowGuild((v) => !v);
      if (e.key === 'e' || e.key === 'E') setShowEnhancement((v) => !v);
      if (e.key === 't' || e.key === 'T') setShowSkillTree((v) => !v);
      if (e.key === 'Escape') {
        setShowInventory(false); setShowStats(false); setShowParty(false);
        setShowMap(false); setShowGuild(false); setShowEnhancement(false);
        setShowSkillTree(false); setShowSettings(false); setShowTrading(false);
      }
      // Attack nearest monster with F or Space
      if (e.key === 'f' || e.key === 'F' || e.key === ' ') {
        e.preventDefault();
        const monsters = game.monsters?.filter(m => m.currentHP > 0) || [];
        if (monsters.length > 0 && game.playerPosition) {
          const nearest = monsters.sort((a, b) => {
            const distA = Math.hypot(a.position.x - game.playerPosition.x, a.position.z - game.playerPosition.z);
            const distB = Math.hypot(b.position.x - game.playerPosition.x, b.position.z - game.playerPosition.z);
            return distA - distB;
          })[0];
          if (nearest) emit('player:attack', { targetId: nearest.instanceId });
        }
      }
      keysDown.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e) => { keysDown.current.delete(e.key.toLowerCase()); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [game.monsters, game.playerPosition]);

  // Movement
  useEffect(() => {
    const interval = setInterval(() => {
      const pos = game.playerPosition;
      if (!pos) return;
      let dx = 0, dz = 0;
      if (keysDown.current.has('w') || keysDown.current.has('arrowup')) dz -= 2;
      if (keysDown.current.has('s') || keysDown.current.has('arrowdown')) dz += 2;
      if (keysDown.current.has('a') || keysDown.current.has('arrowleft')) dx -= 2;
      if (keysDown.current.has('d') || keysDown.current.has('arrowright')) dx += 2;
      if (dx !== 0 || dz !== 0) {
        emit('player:move', { x: pos.x + dx, y: pos.y, z: pos.z + dz });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [game.playerPosition]);

  const handleMove = useCallback((dx, dz) => {
    const pos = game.playerPosition;
    if (!pos) return;
    emit('player:move', { x: pos.x + dx * 2, y: pos.y, z: pos.z + dz * 2 });
  }, [game.playerPosition]);

  const handleChatSend = (data) => {
    const msg = typeof data === 'string' ? data : data.message || chatInput;
    const type = typeof data === 'object' ? data.type : 'global';
    if (!msg.trim()) return;
    emit('chat:message', { message: msg.trim(), type });
    dispatch(addChatMessage({
      id: Date.now(), sender: 'You', message: msg.trim(), type, timestamp: Date.now(),
    }));
    setChatInput('');
  };

  const handleSelectMonster = (monster) => {
    emit('player:attack', { targetId: monster.instanceId });
  };

  const handleUseSkill = (skillId) => {
    emit('player:useSkill', { skillId });
  };

  if (loading) {
    return <LoadingScreen message="Connecting to game server..." />;
  }

  return (
    <div className="game-scene">
      <Canvas shadows>
        <Scene3D
          monsters={game.monsters || []}
          npcs={game.npcs || []}
          itemsOnGround={game.itemsOnGround || []}
          playerPosition={game.playerPosition}
          onSelectMonster={handleSelectMonster}
        />
      </Canvas>

      <Minimap />
      <Notifications />

      <HUD
        hp={game.playerHP}
        maxHP={game.playerMaxHP}
        mp={game.playerMP}
        maxMP={game.playerMaxMP}
        level={game.playerLevel}
        exp={game.playerExp}
        gold={game.playerGold}
        chatVisible={chatVisible}
        chatMessages={game.chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onChatSend={handleChatSend}
      />

      <SkillHotbar onUseSkill={handleUseSkill} />

      {showInventory && <InventoryPanel
        inventory={game.inventory || []}
        equipment={game.equipment || {}}
        onClose={() => setShowInventory(false)}
      />}

      {showStats && <StatsPanel
        stats={game.stats || {}}
        level={game.playerLevel}
        hp={game.playerHP}
        maxHP={game.playerMaxHP}
        mp={game.playerMP}
        maxMP={game.playerMaxMP}
        onClose={() => setShowStats(false)}
      />}

      {showParty && <PartyPanel onClose={() => setShowParty(false)} />}
      {showMap && <MapSelector currentMap={game.currentMap} onClose={() => setShowMap(false)} />}
      {showGuild && <GuildPanel onClose={() => setShowGuild(false)} />}
      {showEnhancement && <EnhancementPanel onClose={() => setShowEnhancement(false)} />}
      {showSkillTree && <SkillTreePanel onClose={() => setShowSkillTree(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {game.shopOpen && <ShopPanel
        shop={game.shopOpen}
        gold={game.playerGold}
        onClose={() => dispatch(setShop(null))}
      />}

      <div className="game-controls">
        <button onClick={() => setShowInventory(!showInventory)} className="ctrl-btn">Inv (I)</button>
        <button onClick={() => setShowStats(!showStats)} className="ctrl-btn">Stats (C)</button>
        <button onClick={() => setChatVisible(!chatVisible)} className="ctrl-btn">Chat (Enter)</button>
        <button onClick={() => setShowParty(!showParty)} className="ctrl-btn">Party (P)</button>
        <button onClick={() => setShowMap(!showMap)} className="ctrl-btn">Map (M)</button>
        <button onClick={() => setShowGuild(!showGuild)} className="ctrl-btn">Guild (G)</button>
        <button onClick={() => setShowEnhancement(!showEnhancement)} className="ctrl-btn">Enhance (E)</button>
        <button onClick={() => setShowSkillTree(!showSkillTree)} className="ctrl-btn">Skills (T)</button>
        <button onClick={() => setShowSettings(!showSettings)} className="ctrl-btn">⚙ Settings</button>
      </div>

      <div className="movement-controls">
        <button className="move-btn" onClick={() => handleMove(0, -1)}>▲</button>
        <div style={{ display: 'flex', gap: '60px' }}>
          <button className="move-btn" onClick={() => handleMove(-1, 0)}>◄</button>
          <button className="move-btn" onClick={() => handleMove(1, 0)}>►</button>
        </div>
        <button className="move-btn" onClick={() => handleMove(0, 1)}>▼</button>
      </div>

      <div style={{ position: 'fixed', bottom: '10px', right: '200px', color: '#aaa', fontSize: '11px', zIndex: 100, pointerEvents: 'none' }}>
        [F/Space] Attack | [WASD/Arrows] Move | [I] Inventory | [C] Stats | [ESC] Close
      </div>
    </div>
  );
}