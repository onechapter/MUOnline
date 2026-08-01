import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { on, emit } from '../../network/SocketManager';
import { setInventory, addGold, updatePlayerGold, addNotification } from '../../store/gameSlice';

export default function TradingPanel({ onClose }) {
  const dispatch = useDispatch();
  const inventory = useSelector((state) => state.game.inventory);
  const [partnerItems, setPartnerItems] = useState([]);
  const [myTradeItems, setMyTradeItems] = useState([]);
  const [partnerTradeItems, setPartnerTradeItems] = useState([]);
  const [myReady, setMyReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub1 = on('trade:accepted', (d) => {
      setPartnerReady(false);
      setMessage('Trade accepted! Add items to trade.');
    });
    const unsub2 = on('trade:declined', () => {
      setMessage('Trade was declined');
      setMyTradeItems([]);
      setPartnerTradeItems([]);
      setMyReady(false);
      setPartnerReady(false);
    });
    const unsub3 = on('trade:partner-items', (d) => {
      setPartnerTradeItems(d.items || []);
    });
    const unsub4 = on('trade:partner-ready', () => setPartnerReady(true));
    const unsub5 = on('trade:partner-not-ready', () => setPartnerReady(false));
    const unsub6 = on('trade:complete', (d) => {
      if (d.receivedItems) dispatch(setInventory([...inventory, ...d.receivedItems]));
      if (d.goldReceived) dispatch(addGold(d.goldReceived));
      setMessage('Trade complete!');
      setMyTradeItems([]);
      setPartnerTradeItems([]);
      setMyReady(false);
      setPartnerReady(false);
    });
    const unsub7 = on('trade:error', (d) => setMessage(d.message || 'Trade error'));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7(); };
  }, [dispatch, inventory]);

  const handleAddItem = (itemIndex) => {
    if (!inventory[itemIndex]) return;
    emit('trade:item', { inventoryIndex: itemIndex });
    setMyTradeItems((prev) => [...prev, inventory[itemIndex]]);
  };

  const handleRemoveTradeItem = (tradeIndex) => {
    emit('trade:remove-item', { tradeIndex });
    setMyTradeItems((prev) => prev.filter((_, i) => i !== tradeIndex));
    setMyReady(false);
  };

  const handleToggleReady = () => {
    emit('trade:ready', { ready: !myReady });
    setMyReady((prev) => !prev);
  };

  const handleConfirm = () => {
    if (myReady && partnerReady) {
      emit('trade:confirm', {});
    }
  };

  const handleCancel = () => {
    emit('trade:cancel', {});
    onClose();
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel trading-panel" onClick={(e) => e.stopPropagation()} style={{ minWidth: '600px' }}>
        <div className="panel-header">
          <h3>Trade</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        {message && (
          <div style={{ padding: '8px', background: '#1a2a1a', borderRadius: '4px', marginBottom: '10px', color: '#8f8', fontSize: '13px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* My side */}
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#4af', margin: '0 0 8px' }}>My Offer</h4>
            <div style={{ minHeight: '100px', background: '#111', border: '1px solid #333', borderRadius: '4px', padding: '8px' }}>
              {myTradeItems.length === 0 && <div style={{ color: '#555', textAlign: 'center', marginTop: 30 }}>Click items below to add</div>}
              {myTradeItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', borderBottom: '1px solid #222', fontSize: '12px' }}>
                  <span style={{ color: '#ddd' }}>{item.name}</span>
                  <button onClick={() => handleRemoveTradeItem(i)} style={{ background: '#522', color: '#f88', border: 'none', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ color: '#aaa', margin: '0 0 6px', fontSize: '13px' }}>Inventory ({inventory.length}/64)</h4>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {inventory.slice(0, 16).map((item, i) => (
                  <div key={i} onClick={() => handleAddItem(i)} style={{
                    background: '#1a2a3a', border: '1px solid #334', padding: '4px', borderRadius: '3px',
                    cursor: 'pointer', fontSize: '10px', color: '#adf', textAlign: 'center',
                  }}>
                    {item.name?.substring(0, 8) || '?'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: '40px' }}>
            <div style={{ width: 2, height: '100%', background: '#333' }} />
            <div style={{ color: '#666', fontSize: '12px' }}>VS</div>
          </div>

          {/* Partner side */}
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#f84', margin: '0 0 8px' }}>Partner's Offer</h4>
            <div style={{ minHeight: '100px', background: '#111', border: '1px solid #333', borderRadius: '4px', padding: '8px' }}>
              {partnerTradeItems.length === 0 && <div style={{ color: '#555', textAlign: 'center', marginTop: 30 }}>Waiting for partner...</div>}
              {partnerTradeItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', borderBottom: '1px solid #222', fontSize: '12px' }}>
                  <span style={{ color: '#ddd' }}>{item.name || 'Item'}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', padding: '8px', background: '#1a1a2a', borderRadius: '4px', fontSize: '12px', color: '#aaa' }}>
              Partner: {partnerReady ? <span style={{ color: '#4a4' }}>✓ Ready</span> : <span style={{ color: '#aa4' }}>○ Not ready</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={handleToggleReady} disabled={!myTradeItems.length} style={{
            background: myReady ? '#2a7a2a' : '#555', color: 'white', border: 'none', padding: '8px 20px',
            borderRadius: '4px', cursor: myTradeItems.length ? 'pointer' : 'not-allowed',
          }}>
            {myReady ? 'Unready' : 'Ready'}
          </button>
          <button onClick={handleConfirm} disabled={!myReady || !partnerReady} style={{
            background: myReady && partnerReady ? '#4a4' : '#555', color: 'white', border: 'none', padding: '8px 20px',
            borderRadius: '4px', cursor: myReady && partnerReady ? 'pointer' : 'not-allowed',
          }}>
            Confirm Trade
          </button>
          <button onClick={handleCancel} style={{
            background: '#7a2a2a', color: 'white', border: 'none', padding: '8px 20px',
            borderRadius: '4px', cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}