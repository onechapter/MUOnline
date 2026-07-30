import { useState, useEffect } from 'react';
import { on, emit } from '../../network/SocketManager';

export default function GuildPanel({ onClose }) {
  const [guildName, setGuildName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub = on('guild:created', () => setMessage('Guild created!'));
    const unsub2 = on('guild:error', (d) => setMessage(d.message || 'Error'));
    const unsub3 = on('guild:joined', () => setMessage('Joined guild!'));
    return () => { unsub(); unsub2(); unsub3(); };
  }, []);

  const handleCreateGuild = () => {
    if (!guildName.trim()) return;
    emit('guild:create', { name: guildName });
  };

  const handleInvite = () => {
    if (!memberInput.trim()) return;
    emit('guild:invite', { targetId: memberInput });
    setMessage(`Invite sent to ${memberInput}`);
    setMemberInput('');
  };

  const handleLeaveGuild = () => {
    emit('guild:leave', {});
    setMessage('Left guild');
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel guild-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Guild</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        {message && <div className="guild-message">{message}</div>}
        <div className="guild-actions">
          <input
            type="text"
            placeholder="Guild name"
            value={guildName}
            onChange={(e) => setGuildName(e.target.value)}
          />
          <button onClick={handleCreateGuild}>Create Guild</button>
          <button onClick={handleLeaveGuild} className="guild-leave-btn">Leave Guild</button>
        </div>
        <div className="guild-invite">
          <input
            type="text"
            placeholder="Player ID"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />
          <button onClick={handleInvite}>Invite</button>
        </div>
        <div className="guild-members">
          <div className="empty-guild">No guild members</div>
        </div>
      </div>
    </div>
  );
}