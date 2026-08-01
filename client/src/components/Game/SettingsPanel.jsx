import { useState } from 'react';
import { useSelector } from 'react-redux';
import { on, emit } from '../../network/SocketManager';
import { addNotification } from '../../store/gameSlice';
import { useDispatch } from 'react-redux';

export default function SettingsPanel({ onClose }) {
  const dispatch = useDispatch();
  const [showMinimap, setShowMinimap] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [showDamage, setShowDamage] = useState(true);
  const [showCoords, setShowCoords] = useState(false);
  const [autoPickup, setAutoPickup] = useState(false);
  const [attackRange, setAttackRange] = useState(2);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel settings-panel" onClick={(e) => e.stopPropagation()} style={{ minWidth: '400px' }}>
        <div className="panel-header">
          <h3>⚙ Settings</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
          {/* Display */}
          <div>
            <h4 style={{ margin: '0 0 8px', color: '#4af', borderBottom: '1px solid #333', paddingBottom: '4px' }}>Display</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <input type="checkbox" checked={showMinimap} onChange={() => setShowMinimap(!showMinimap)} />
                Show Minimap
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <input type="checkbox" checked={showNames} onChange={() => setShowNames(!showNames)} />
                Show Entity Names
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <input type="checkbox" checked={showDamage} onChange={() => setShowDamage(!showDamage)} />
                Show Damage Numbers
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <input type="checkbox" checked={showCoords} onChange={() => setShowCoords(!showCoords)} />
                Show Coordinates
              </label>
            </div>
          </div>

          {/* Combat */}
          <div>
            <h4 style={{ margin: '0 0 8px', color: '#f44', borderBottom: '1px solid #333', paddingBottom: '4px' }}>Combat</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <input type="checkbox" checked={autoPickup} onChange={() => setAutoPickup(!autoPickup)} />
                Auto Pick-Up Items
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '13px' }}>
                <span>Attack Range:</span>
                <input
                  type="range" min="1" max="5" value={attackRange}
                  onChange={(e) => setAttackRange(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ minWidth: '20px' }}>{attackRange}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '6px', padding: '10px', marginTop: '8px' }}>
            <h4 style={{ margin: '0 0 6px', color: '#888', fontSize: '12px' }}>Controls</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>F/Space</kbd> Attack</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>WASD</kbd> Move</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>I</kbd> Inventory</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>C</kbd> Stats</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>P</kbd> Party</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>M</kbd> Map</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>G</kbd> Guild</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>E</kbd> Enhance</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>T</kbd> Skills</div>
              <div><kbd style={{ background: '#222', padding: '1px 4px', borderRadius: '3px', color: '#aaa' }}>ESC</kbd> Close</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}