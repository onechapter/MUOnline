import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { emit } from '../../network/SocketManager';

export default function SkillTreePanel({ onClose }) {
  const player = useSelector((state) => state.game.player);
  const playerLevel = useSelector((state) => state.game.playerLevel || 1);
  const [skills, setSkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [message, setMessage] = useState('');

  // Load skills from player data
  useEffect(() => {
    if (player?.skills) {
      setSkills(player.skills);
    } else {
      setSkills([]);
    }
  }, [player]);

  const handleUpgrade = (skillId) => {
    emit('skill:upgrade', { skillId });
    setMessage('Upgrading skill...');
  };

  const handleUseSkill = (skillId) => {
    emit('player:useSkill', { skillId });
  };

  if (!skills || skills.length === 0) {
    return (
      <div className="panel-overlay" onClick={onClose}>
        <div className="panel skill-panel" onClick={(e) => e.stopPropagation()}>
          <div className="panel-header">
            <h3>Skill Tree</h3>
            <button className="panel-close" onClick={onClose}>X</button>
          </div>
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>No skills learned yet</p>
            <p style={{ fontSize: '12px' }}>Skills unlock as you level up</p>
            <p style={{ fontSize: '12px', color: '#aaa' }}>Current Level: {playerLevel}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel skill-panel" onClick={(e) => e.stopPropagation()} style={{ minWidth: '500px' }}>
        <div className="panel-header">
          <h3>Skill Tree (Lv.{playerLevel})</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        {message && (
          <div style={{ padding: '6px', background: '#1a2a1a', borderRadius: '4px', marginBottom: '10px', color: '#8f8', fontSize: '12px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto' }}>
          {skills.map((skill) => (
            <div
              key={skill.skillId}
              onClick={() => setActiveSkill(activeSkill === skill.skillId ? null : skill.skillId)}
              style={{
                background: activeSkill === skill.skillId ? '#2a3a2a' : '#1a1a2a',
                border: `1px solid ${activeSkill === skill.skillId ? '#4a4' : '#334'}`,
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#ddd', fontWeight: 'bold', fontSize: '13px' }}>{skill.name || skill.skillId}</span>
                  <span style={{ color: '#aaa', fontSize: '11px', marginLeft: '8px' }}>Lv.{skill.level || 1}</span>
                  <span style={{
                    color: skill.type === 'Passive' ? '#4af' : skill.type === 'AOE' ? '#f44' : '#4f4',
                    fontSize: '10px', marginLeft: '6px',
                  }}>
                    [{skill.type || 'Active'}]
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleUseSkill(skill.skillId); }} style={{
                    background: '#2a5a2a', color: 'white', border: 'none', padding: '2px 8px',
                    borderRadius: '3px', cursor: 'pointer', fontSize: '11px',
                  }}>Use</button>
                  <button onClick={(e) => { e.stopPropagation(); handleUpgrade(skill.skillId); }} style={{
                    background: '#5a5a2a', color: 'white', border: 'none', padding: '2px 8px',
                    borderRadius: '3px', cursor: 'pointer', fontSize: '11px',
                  }}>Upgrade</button>
                </div>
              </div>
              {activeSkill === skill.skillId && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#999' }}>
                  Damage: {skill.damage || 'N/A'} | Mana: {skill.manaCost || 'N/A'} | Cooldown: {skill.cooldown || 'N/A'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}