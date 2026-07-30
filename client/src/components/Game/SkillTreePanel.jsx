import { useState, useEffect } from 'react';
import api from '../../api';
import { emit } from '../../network/SocketManager';
import { useSelector } from 'react-redux';

export default function SkillTreePanel({ onClose }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const player = useSelector((state) => state.game.player);
  const playerLevel = useSelector((state) => state.game.playerLevel);

  useEffect(() => {
    api.get('/game/skills')
      .then(({ data }) => setSkills(data.data || []))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, []);

  const playerClass = player?.characterClass;
  const playerSkills = player?.skills || [];
  const isLearned = (skillId) => playerSkills.some((s) => s.skillId === skillId);
  const canLearn = (skill) => skill.class === playerClass && playerLevel >= skill.level && !isLearned(skill.skillId);

  const handleLearn = (skillId) => {
    emit('skill:learn', { skillId });
    onClose();
  };

  const handleUse = (skillId) => {
    emit('player:useSkill', { skillId });
  };

  if (loading) return null;

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel skill-tree-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Skill Tree{playerClass ? ` - ${playerClass}` : ''}</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        <div className="skill-list">
          {skills.length === 0 && <div className="skill-empty">No skills available</div>}

          {skills.map((skill) => {
            const learned = isLearned(skill.skillId);
            const can = canLearn(skill);
            const wrongClass = skill.class !== playerClass;
            const locked = !wrongClass && playerLevel < skill.level;

            return (
              <div key={skill.skillId} className={`skill-card ${learned ? 'learned' : ''} ${can ? 'can-learn' : ''}`}>
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className={`skill-type ${getTypeColor(skill.type)}`}>{skill.type}</span>
                </div>
                <div className="skill-desc">{skill.description}</div>
                <div className="skill-stats">
                  <span>Class: {skill.class}</span>
                  <span>Lv: {skill.level}</span>
                  {skill.damage > 0 && <span>Dmg: {skill.damage}</span>}
                  {skill.manaCost > 0 && <span>MP: {skill.manaCost}</span>}
                  {skill.cooldown > 0 && <span>CD: {(skill.cooldown / 1000).toFixed(0)}s</span>}
                </div>
                <div className="skill-actions">
                  {learned && (
                    <button className="skill-btn learned-btn">Learned</button>
                  )}
                  {can && (
                    <button className="skill-btn learn-btn" onClick={() => handleLearn(skill.skillId)}>
                      Learn
                    </button>
                  )}
                  {locked && <span className="skill-locked">Requires Level {skill.level}</span>}
                  {wrongClass && <span className="skill-wrong-class">Wrong class ({skill.class})</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type) {
  switch (type) {
    case 'Active': return 'color: #e74c3c';
    case 'Passive': return 'color: #27ae60';
    case 'AOE': return 'color: #9b59b6';
    case 'Buff': return 'color: #f1c40f';
    case 'Debuff': return 'color: #e67e22';
    default: return 'color: #aaa';
  }
}