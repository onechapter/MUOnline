import { useState } from 'react';
import { useSelector } from 'react-redux';
import { emit } from '../../network/SocketManager';

export default function PartyPanel({ onClose }) {
  const party = useSelector((state) => state.game.party);
  const members = useSelector((state) => state.game.partyMembers);
  const pendingInvite = useSelector((state) => state.game.pendingPartyInvite);
  const [memberInput, setMemberInput] = useState('');

  const handleCreateParty = () => {
    emit('party:create', {});
  };

  const handleInvite = () => {
    if (!memberInput.trim()) return;
    emit('party:invite', { targetId: memberInput });
    setMemberInput('');
  };

  const handleLeaveParty = () => {
    emit('party:leave', {});
  };

  const handleAcceptInvite = () => {
    if (pendingInvite) {
      emit('party:accept', {});
    }
  };

  const handleDeclineInvite = () => {
    emit('party:decline', {});
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel party-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Party {party ? `(${party.name})` : ''}</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        {pendingInvite && (
          <div className="invite-pending" style={{
            background: '#2a1a00', padding: '10px', borderRadius: '6px', marginBottom: '10px',
            border: '1px solid #ffaa00', textAlign: 'center',
          }}>
            <div style={{ color: '#ffaa00', marginBottom: '6px' }}>
              {pendingInvite.from} invites you to join their party!
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={handleAcceptInvite} style={{
                background: '#2a7a2a', color: 'white', border: 'none', padding: '4px 16px',
                borderRadius: '4px', cursor: 'pointer',
              }}>Accept</button>
              <button onClick={handleDeclineInvite} style={{
                background: '#7a2a2a', color: 'white', border: 'none', padding: '4px 16px',
                borderRadius: '4px', cursor: 'pointer',
              }}>Decline</button>
            </div>
          </div>
        )}

        <div className="party-info">
          {party ? (
            <>
              <div className="party-members" style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#aaa' }}>Members ({members.length})</h4>
                {members.length === 0 && <div style={{ color: '#888' }}>No members</div>}
                {members.map((m) => (
                  <div key={m.id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                    borderBottom: '1px solid #333', fontSize: '13px',
                  }}>
                    <span style={{ color: '#4af' }}>{m.name}</span>
                    <span style={{ color: '#aaa' }}>Lv.{m.level || '?'}</span>
                  </div>
                ))}
              </div>
              <div className="party-actions">
                <input
                  type="text"
                  placeholder="Player ID to invite"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  style={{ background: '#111', border: '1px solid #444', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginRight: '6px' }}
                />
                <button onClick={handleInvite} style={{
                  background: '#2a5a8a', color: 'white', border: 'none', padding: '4px 12px',
                  borderRadius: '4px', cursor: 'pointer',
                }}>Invite</button>
                <button onClick={handleLeaveParty} style={{
                  background: '#8a2a2a', color: 'white', border: 'none', padding: '4px 12px',
                  borderRadius: '4px', cursor: 'pointer', marginLeft: '6px',
                }}>Leave</button>
              </div>
            </>
          ) : (
            <div className="no-party" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              <p>You are not in a party</p>
              <button onClick={handleCreateParty} style={{
                background: '#2a5a8a', color: 'white', border: 'none', padding: '8px 20px',
                borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
              }}>Create Party</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}