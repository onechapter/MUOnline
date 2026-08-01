import { emit } from '../../network/SocketManager';
import { useSelector } from 'react-redux';

const maps = [
  { mapId: 'lorencia', name: 'Lorencia', description: 'Starting town - safe zone', levelRange: [1, 10], x: 128, z: 128, color: '#4a90d9' },
  { mapId: 'dungeon', name: 'Dungeon', description: 'Dark underground caves', levelRange: [5, 15], x: 128, z: 128, color: '#8b4513' },
  { mapId: 'devias', name: 'Devias', description: 'Snowy mountain peak', levelRange: [15, 30], x: 128, z: 128, color: '#b0c4de' },
  { mapId: 'noria', name: 'Noria', description: 'Ancient desert city', levelRange: [30, 40], x: 128, z: 128, color: '#daa520' },
  { mapId: 'atlans', name: 'Atlans', description: 'Frozen ice cave', levelRange: [40, 50], x: 128, z: 128, color: '#87ceeb' },
];

export default function MapSelector({ currentMap, onClose }) {
  const playerLevel = useSelector((state) => state.game.playerLevel || 1);

  const handleTeleport = (map) => {
    emit('map:change', { mapId: map.mapId, x: map.x, z: map.z });
    onClose();
  };

  const isLocked = (map) => playerLevel < map.levelRange[0];

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel map-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>World Map</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        <div className="map-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {maps.map((map) => (
            <div
              key={map.mapId}
              className={`map-entry ${map.mapId === currentMap ? 'current' : ''}`}
              onClick={() => !isLocked(map) && handleTeleport(map)}
              style={{
                background: map.mapId === currentMap ? '#2a4a2a' : isLocked(map) ? '#1a1a2a' : '#1a2a1a',
                border: `1px solid ${map.mapId === currentMap ? '#4a4' : isLocked(map) ? '#444' : '#333'}`,
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: isLocked(map) ? 'not-allowed' : 'pointer',
                opacity: isLocked(map) ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', background: map.color,
                  border: map.mapId === currentMap ? '2px solid #fff' : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div className="map-name" style={{ color: '#ddd', fontWeight: 'bold', fontSize: '14px' }}>
                    {map.name} {map.mapId === currentMap && <span style={{ color: '#4a4', fontSize: '11px' }}>[Here]</span>}
                  </div>
                  <div className="map-desc" style={{ color: '#999', fontSize: '12px' }}>{map.description}</div>
                </div>
                <div className="map-level" style={{ color: isLocked(map) ? '#a44' : '#aaa', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {isLocked(map) ? `🔒 Lv.${map.levelRange[0]}+` : `Lv. ${map.levelRange[0]}-${map.levelRange[1]}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}