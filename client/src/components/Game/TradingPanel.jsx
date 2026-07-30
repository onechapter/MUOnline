import { useState } from 'react';
import { useSelector } from 'react-redux';
import { emit, on } from '../../network/SocketManager';

export default function TradingPanel({ targetPlayer, onClose }) {
  const game = useSelector((state) => state.game);
  const [goldInput, setGoldInput] = useState(0);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [opponentItems, setOpponentItems] = useState([]);

  const handleAcceptTrade = () => {
    emit('trade:accept', { challengerId: targetPlayer?.id, targetId: 'me' });
    const unsub = on('trade:accepted', () => {
      unsub();
    });
    on('trade:updated', (d) => {
      const side = d.trade.player1.id === 'me' ? d.trade.player2 : d.trade.player1;
      setOpponentItems(side.items);
      setOpponentReady(d.trade.ready.player1 && d.trade.ready.player2);
    });
    on('trade:ready', (d) => {
      setOpponentReady(d.trade.ready.player2);
    });
    on('trade:completed', () => onClose());
    on('trade:cancelled', () => onClose());
  };

  const handleAddItem = (index) => {
    emit('trade:item', { inventoryIndex: index });
    setMyItems((prev) => [...prev, game.inventory[index]]);
  };

  const handleAddGold = () => {
    emit('trade:gold', { amount: goldInput });
  };

  const handleReady = () => {
    emit('trade:ready');
    setMyReady(true);
  };

  const handleComplete = () => {
    emit('trade:complete');
  };

  const handleCancel = () => {
    emit('trade:cancel');
    onClose();
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel trading-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Trade with {targetPlayer}</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>
        {!myItems.length && !opponentItems.length ? (
          <div className="trade-pending">
            <p>Waiting for trade to start...</p>
            <button onClick={handleAcceptTrade}>Accept Trade</button>
            <button onClick={handleCancel}>Decline</button>
          </div>
        ) : (
          <>
            <div className="trade-container">
              <div className="trade-side">
                <h4>Your Items</h4>
                <div className="trade-items">
                  {game.inventory.slice(0, 16).map((item, i) => (
                    <div
                      key={i}
                      className="trade-item"
                      onClick={() => handleAddItem(i)}
                      title={item.name}
                    >
                      {item.name?.substring(0, 8) || '?'}
                    </div>
                  ))}
                </div>
                <div className="trade-gold">
                  <input
                    type="number"
                    value={goldInput}
                    onChange={(e) => setGoldInput(Number(e.target.value))}
                    min={0}
                    max={game.playerGold}
                    placeholder="Gold amount"
                  />
                  <button onClick={handleAddGold}>Add Gold</button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="trade-ready-btn" disabled={myReady} onClick={handleReady}>
                    {myReady ? 'Ready' : 'Mark Ready'}
                  </button>
                  {myReady && !opponentReady && (
                    <button className="trade-complete-btn" onClick={handleComplete}>Complete</button>
                  )}
                </div>
              </div>
              <div className="trade-divider">
                <div className="trade-vs">VS</div>
                {opponentReady && <div className="opponent-ready">Ready</div>}
              </div>
              <div className="trade-side">
                <h4>{targetPlayer}'s Items</h4>
                <div className="trade-items">
                  {opponentItems.map((item, i) => (
                    <div key={i} className="trade-item other">{item.name?.substring(0, 8)}</div>
                  ))}
                  {!opponentItems.length && <div className="trade-empty">No items yet</div>}
                </div>
              </div>
            </div>
            <button className="trade-cancel" onClick={handleCancel}>Cancel Trade</button>
          </>
        )}
      </div>
    </div>
  );
}