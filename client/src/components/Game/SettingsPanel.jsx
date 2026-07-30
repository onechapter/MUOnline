import { useState } from 'react';

export default function SettingsPanel({ onClose }) {
  const [graphics, setGraphics] = useState('high');
  const [showMinimap, setShowMinimap] = useState(true);
  const [soundVolume, setSoundVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(60);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Settings</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        <div className="settings-group">
          <h4>Graphics</h4>
          <select value={graphics} onChange={(e) => setGraphics(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>
        <div className="settings-group">
          <h4>Sound</h4>
          <div className="volume-control">
            <label>SFX: {soundVolume}%</label>
            <input type="range" min={0} max={100} value={soundVolume} onChange={(e) => setSoundVolume(Number(e.target.value))} />
          </div>
          <div className="volume-control">
            <label>Music: {musicVolume}%</label>
            <input type="range" min={0} max={100} value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} />
          </div>
        </div>
        <div className="settings-group">
          <label className="settings-label">
            <input type="checkbox" checked={showMinimap} onChange={() => setShowMinimap(!showMinimap)} />
            Show Minimap
          </label>
        </div>
        <div className="settings-keys">
          <h4>Key Bindings</h4>
          <div className="key-row"><span>Movement</span><span>WASD / Arrow Keys</span></div>
          <div className="key-row"><span>Inventory</span><span>I</span></div>
          <div className="key-row"><span>Stats</span><span>C</span></div>
          <div className="key-row"><span>Chat</span><span>Enter</span></div>
          <div className="key-row"><span>Party</span><span>P</span></div>
          <div className="key-row"><span>Map</span><span>M</span></div>
          <div className="key-row"><span>Guild</span><span>G</span></div>
          <div className="key-row"><span>Enhance</span><span>E</span></div>
          <div className="key-row"><span>Skills</span><span>1-9</span></div>
        </div>
      </div>
    </div>
  );
}