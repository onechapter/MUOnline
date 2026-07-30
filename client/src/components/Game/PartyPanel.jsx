import { useState } from 'react';
import { emit } from '../../network/SocketManager';

export default function PartyPanel({ onClose }) {
  const [memberInput, setMemberInput] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateParty = () => {
    emit('party:create', {});
    setMessage('Party created!');
  };

  const handleInvite = () => {
    if (!memberInput.trim()) return;
    emit('party:invite', { targetId: memberInput });
    setMessage(`Invite sent to ${memberInput}`);
    setMemberInput('');
  };

  const handleLeaveParty = () => {
    emit('party:leave', {});
    setMessage('Left party');
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel party-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Party</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        {message && <div className="party-message">{message}</div>}
        <div className="party-actions">
          <button className="party-btn" onClick={handleCreateParty}>Create Party</button>
          <button className="party-btn" onClick={handleLeaveParty}>Leave Party</button>
        </div>
        <div className="party-invite">
          <input
            type="text"
            placeholder="Player ID"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />
          <button onClick={handleInvite}>Invite</button>
        </div>
        <div className="party-members">
          <div className="empty-party">No party members</div>
        </div>
      </div>
    </div>
  );
}