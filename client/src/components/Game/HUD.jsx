import { useState, useRef, useEffect } from 'react';

const CHANNELS = [
  { key: 'global', label: 'Global' },
  { key: 'party', label: 'Party' },
  { key: 'guild', label: 'Guild' },
  { key: 'whisper', label: 'Whisper' },
];

const CHANNEL_COLORS = {
  global: '#ddd',
  party: '#4a90d9',
  guild: '#9b59b6',
  whisper: '#27ae60',
  system: '#ffcc00',
};

export default function HUD({
  hp,
  maxHP,
  mp,
  maxMP,
  level,
  exp,
  gold,
  chatVisible,
  chatMessages,
  chatInput,
  setChatInput,
  onChatSend,
}) {
  const [activeChannel, setActiveChannel] = useState('global');
  const chatRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChannel]);

  const hpPercent = maxHP > 0 ? (hp / maxHP) * 100 : 0;
  const mpPercent = maxMP > 0 ? (mp / maxMP) * 100 : 0;

  const filteredMessages = chatMessages.filter((msg) => {
    if (msg.type === 'system') return true;
    return msg.type === activeChannel;
  });

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();

    if (text.startsWith('/w ') || text.startsWith('/whisper ')) {
      const parts = text.slice(3).split(' ');
      const username = parts[0];
      const message = parts.slice(1).join(' ');
      if (username && message) {
        onChatSend({ type: 'whisper', username, message });
        setChatInput('');
        return;
      }
    }

    onChatSend({ type: activeChannel, message: text });
    setChatInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <div className="hud-overlay">
      <div className="hud-top">
        <div className="player-info">
          <div className="player-name">Level {level}</div>
          <div className="bar-container">
            <div className="bar-label">HP</div>
            <div className="bar hp-bar">
              <div className="bar-fill" style={{ width: `${hpPercent}%` }} />
            </div>
            <div className="bar-text">{hp}/{maxHP}</div>
          </div>
          <div className="bar-container">
            <div className="bar-label">MP</div>
            <div className="bar mp-bar">
              <div className="bar-fill" style={{ width: `${mpPercent}%` }} />
            </div>
            <div className="bar-text">{mp}/{maxMP}</div>
          </div>
          <div className="gold-display">Gold: {gold}</div>
        </div>
      </div>

      {chatVisible && (
        <div className="hud-chat" ref={chatRef}>
          <div className="chat-tabs">
            {CHANNELS.map((ch) => (
              <button
                key={ch.key}
                className={`chat-tab ${activeChannel === ch.key ? 'active' : ''}`}
                onClick={() => setActiveChannel(ch.key)}
              >
                {ch.label}
              </button>
            ))}
          </div>
          <div className="chat-messages">
            {filteredMessages.slice(-50).map((msg) => (
              <div key={msg.id} className="chat-message">
                {msg.type === 'system' ? (
                  <span style={{ color: CHANNEL_COLORS.system }}>{msg.message}</span>
                ) : (
                  <>
                    <span style={{ color: CHANNEL_COLORS[msg.type] || CHANNEL_COLORS.global, fontWeight: 'bold' }}>
                      [{msg.sender}]{' '}
                    </span>
                    <span style={{ color: CHANNEL_COLORS.global }}>{msg.message}</span>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <span className="chat-channel-label">[{activeChannel}]</span>
            <input
              type="text"
              className="chat-input"
              placeholder={activeChannel === 'whisper' ? '/w username message' : `Type message... (Enter to send)`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}