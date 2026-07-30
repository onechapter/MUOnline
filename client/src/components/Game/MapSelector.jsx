import { emit } from '../../network/SocketManager';

const maps = [
  { mapId: 'lorencia', name: 'Lorencia', description: 'Starting town', levelRange: [1, 10], x: 128, z: 128 },
  { mapId: 'dungeon', name: 'Dungeon', description: 'Dark underground', levelRange: [5, 15], x: 128, z: 128 },
  { mapId: 'devias', name: 'Devias', description: 'Snowy mountains', levelRange: [15, 30], x: 128, z: 128 },
  { mapId: 'noria', name: 'Noria', description: 'Desert city', levelRange: [30, 40], x: 128, z: 128 },
  { mapId: 'atlans', name: 'Atlans', description: 'Ice cave', levelRange: [40, 50], x: 128, z: 128 },
];

export default function MapSelector({ currentMap, onClose }) {
  const handleTeleport = (map) => {
    emit('map:change', { mapId: map.mapId, x: map.x, z: map.z });
    onClose();
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel map-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>World Map</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        <div className="map-list">
          {maps.map((map) => (
            <div
              key={map.mapId}
              className={`map-entry ${map.mapId === currentMap ? 'current' : ''}`}
              onClick={() => handleTeleport(map)}
            >
              <div className="map-name">{map.name}</div>
              <div className="map-desc">{map.description}</div>
              <div className="map-level">Lv. {map.levelRange[0]}-{map.levelRange[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}