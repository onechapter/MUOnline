import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { on, emit } from '../../network/SocketManager';
import { setParty, setPartyMembers, setPendingPartyInvite } from '../../store/gameSlice';

export default function GuildPanel({ onClose }) {
  const guild = useSelector((state) => state.game.guild);
  const members = useSelector((state) => state.game.guildMembers);
  const pendingInvite = useSelector((state) => state.game.pendingGuildInvite);
  const dispatch = useDispatch();
  const [guildName, setGuildName] = useState('');
  const [memberInput, setMemberInput] = useState('');

  useEffect(() => {
    const unsub1 = on('guild:created', (d) => dispatch(setGuild(d)));
    const unsub2 = on('guild:error', (d) => {
      alert(d.message || 'Guild error');
    });
    const unsub3 = on('guild:joined', (d) => dispatch(setGuild(d)));
    const unsub4 = on('guild:left', () => dispatch(setGuild(null)));
    const unsub5 = on('guild:invite', (d) => dispatch(setPendingGuildInvite(d)));
    const unsub6 = on('guild:member-joined', (d) => {
      if (d.guild) dispatch(setGuild(d.guild));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); };
  }, [dispatch]);

  const handleCreateGuild = () => {
    if (!guildName.trim() || guildName.trim().length < 3) {
      alert('Guild name must be at least 3 characters');
      return;
    }
    emit('guild:create', { name: guildName.trim() });
    setGuildName('');
  };

  const handleInvite = () => {
    if (!memberInput.trim()) return;
    emit('guild:invite', { targetId: memberInput });
    setMemberInput('');
  };

  const handleLeaveGuild = () => {
    if (confirm('Leave your guild?')) {
      emit('guild:leave', {});
    }
  };

  const handleAcceptInvite = () => {
    if (pendingInvite) {
      emit('guild:accept', {});
    }
  };

  const handleDeclineInvite = () => {
    emit('guild:decline', {});
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel guild-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Guild {guild ? `(${guild.name})` : ''}</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        {pendingInvite && (
          <div className="invite-pending" style={{
            background: '#2a1a00', padding: '10px', borderRadius: '6px', marginBottom: '10px',
            border: '1px solid #ffaa00', textAlign: 'center',
          }}>
            <div style={{ color: '#ffaa00', marginBottom: '6px' }}>
              {pendingInvite.from} invites you to join {pendingInvite.guildName}!
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

        {guild ? (
          <>
            <div className="guild-info" style={{ marginBottom: '12px' }}>
              <div style={{ color: '#ddd', fontSize: '13px', marginBottom: '6px' }}>
                Guild: <span style={{ color: '#da5' }}>{guild.name}</span>
              </div>
              <h4 style={{ margin: '0 0 6px', color: '#aaa' }}>Members ({members.length})</h4>
              {members.length === 0 && <div style={{ color: '#888' }}>You are the only member</div>}
              {members.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                  borderBottom: '1px solid #333', fontSize: '13px',
                }}>
                  <span style={{ color: '#da5' }}>{m.name}</span>
                  <span style={{ color: '#aaa' }}>Lv.{m.level || '?'}</span>
                </div>
              ))}
            </div>
            <div className="guild-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Player ID to invite"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                style={{ background: '#111', border: '1px solid #444', color: '#fff', padding: '4px 8px', borderRadius: '4px', flex: 1 }}
              />
              <button onClick={handleInvite} style={{
                background: '#6a5a2a', color: 'white', border: 'none', padding: '4px 12px',
                borderRadius: '4px', cursor: 'pointer',
              }}>Invite</button>
              <button onClick={handleLeaveGuild} style={{
                background: '#8a2a2a', color: 'white', border: 'none', padding: '4px 12px',
                borderRadius: '4px', cursor: 'pointer',
              }}>Leave</button>
            </div>
          </>
        ) : (
          <div className="no-guild" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#888' }}>You are not in a guild</p>
            <input
              type="text"
              placeholder="Guild name (min 3 chars)"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              style={{ background: '#111', border: '1px solid #444', color: '#fff', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px', width: '200px' }}
            />
            <br />
            <button onClick={handleCreateGuild} style={{
              background: '#6a5a2a', color: 'white', border: 'none', padding: '8px 20px',
              borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
            }}>Create Guild</button>
          </div>
        )}
      </div>
    </div>
  );
}