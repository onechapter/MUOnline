import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { emit, on } from '../../network/SocketManager';

export default function EnhancementPanel({ onClose }) {
  const game = useSelector((state) => state.game);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [useJewelBless, setUseJewelBless] = useState(false);
  const [useJewelSoul, setUseJewelSoul] = useState(false);
  const [useJewelChaos, setUseJewelChaos] = useState(false);
  const [message, setMessage] = useState('');

  const selectedItem = game.inventory?.[selectedSlot];

  useEffect(() => {
    const unsub1 = on('enhance:success', (d) => {
      setMessage(d.message || 'Enhancement successful!');
    });
    const unsub2 = on('enhance:failed', (d) => {
      setMessage(d.message || 'Enhancement failed!');
    });
    const unsub3 = on('enhance:error', (d) => setMessage(d.message || 'Error'));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const handleEnhance = () => {
    if (!selectedItem) return;
    const jewels = {
      blessing: useJewelBless ? 1 : 0,
      soul: useJewelSoul ? 1 : 0,
      chaos: useJewelChaos ? 1 : 0,
    };
    emit('enhance:item', {
      inventoryIndex: selectedSlot,
      jewels,
    });
  };

  const getEnhancementLevel = (item) => item?.enhancement || 0;
  const getSuccessRate = (level) => {
    if (level < 7) return 100;
    if (level === 7) return 50;
    if (level === 8) return 40;
    if (level === 9) return 30;
    if (level >= 10) return Math.max(1, 20 - (level - 10) * 3);
    return 0;
  };

  const currentLevel = selectedItem ? getEnhancementLevel(selectedItem) : 0;
  const rate = getSuccessRate(currentLevel + 1);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel enhancement-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Item Enhancement</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        {message && <div className="enhance-message">{message}</div>}
        <div className="enhance-select">
          <h4>Select Item</h4>
          <div className="enhance-grid">
            {game.inventory?.slice(0, 16).map((item, i) => (
              <div
                key={i}
                className={`enhance-item ${i === selectedSlot ? 'selected' : ''}`}
                onClick={() => { setSelectedSlot(i); setMessage(''); }}
              >
                {item.name?.substring(0, 8) || '?'}
                {item.enhancement > 0 && <span className="enhance-level">+{item.enhancement}</span>}
              </div>
            ))}
          </div>
        </div>
        {selectedItem && (
          <div className="enhance-info">
            <div className="enhance-name">{selectedItem.name}</div>
            <div className="enhance-current">Current: +{currentLevel}</div>
            <div className="enhance-rate">
              Success Rate: <span className={rate > 50 ? 'rate-high' : 'rate-low'}>{rate}%</span>
            </div>
            <div className="enhance-jewels">
              <label>
                <input
                  type="checkbox"
                  checked={useJewelBless}
                  onChange={() => setUseJewelBless(!useJewelBless)}
                />
                Jewel of Blessing (protect item)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={useJewelSoul}
                  onChange={() => setUseJewelSoul(!useJewelSoul)}
                />
                Jewel of Soul (+5% rate)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={useJewelChaos}
                  onChange={() => setUseJewelChaos(!useJewelChaos)}
                />
                Jewel of Chaos (random bonus)
              </label>
            </div>
            <button className="enhance-btn" onClick={handleEnhance}>
              Enhance to +{currentLevel + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}