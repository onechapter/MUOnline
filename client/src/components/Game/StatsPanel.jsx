import { emit } from '../../network/SocketManager';

const STAT_NAMES = {
  strength: 'Strength',
  agility: 'Agility',
  vitality: 'Vitality',
  energy: 'Energy',
};

export default function StatsPanel({ stats, level, hp, maxHP, mp, maxMP, onClose }) {
  const handleIncreaseStat = (statName) => {
    const newValue = stats[statName] + 1;
    emit('stats:update', { stat: statName, value: newValue });
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel stats-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Character Stats</h3>
          <button className="panel-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="stats-info">
          <div className="stat-row">
            <span>Level:</span>
            <span>{level}</span>
          </div>
          <div className="stat-row">
            <span>HP:</span>
            <span>
              {hp}/{maxHP}
            </span>
          </div>
          <div className="stat-row">
            <span>MP:</span>
            <span>
              {mp}/{maxMP}
            </span>
          </div>
          <div className="stat-row">
            <span>Available Points:</span>
            <span className="stat-points">{stats.points || 0}</span>
          </div>
        </div>

        <div className="stats-grid">
          {Object.entries(STAT_NAMES).map(([key, label]) => (
            <div key={key} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{stats[key] || 0}</div>
              {stats.points > 0 && (
                <button
                  className="stat-btn"
                  onClick={() => handleIncreaseStat(key)}
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}