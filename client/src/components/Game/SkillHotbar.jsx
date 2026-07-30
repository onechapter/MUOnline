import { useEffect, useState } from 'react';

export default function SkillHotbar({ onUseSkill }) {
  const [skills, setSkills] = useState([]);
  const [cooldowns, setCooldowns] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/api/game/skills')
      .then((r) => r.json())
      .then((data) => setSkills(data.slice(0, 9)))
      .catch(() => {});
  }, []);

  const handleUse = (skill, index) => {
    const key = index + 1;
    if (cooldowns[key]) return;
    onUseSkill(skill.skillId);
    setCooldowns((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    const handler = (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && skills[num - 1]) {
        handleUse(skills[num - 1], num - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [skills, cooldowns]);

  return (
    <div className="skill-hotbar">
      {skills.map((skill, index) => (
        <div
          key={skill.skillId}
          className={`skill-slot ${cooldowns[index + 1] ? 'on-cooldown' : ''}`}
          onClick={() => handleUse(skill, index)}
          title={`${skill.name} (Key ${index + 1})`}
        >
          <div className="skill-key">{index + 1}</div>
          <div className="skill-name">{skill.name}</div>
          <div className="skill-type">{skill.type}</div>
        </div>
      ))}
    </div>
  );
}