import { useState } from 'react';
import { useSelector } from 'react-redux';
import { emit } from '../../network/SocketManager';

export default function ShopPanel({ shop, gold, onClose }) {
  const [activeTab, setActiveTab] = useState('buy');
  const inventory = useSelector((state) => state.game.inventory);

  const handleBuy = (itemId, price) => {
    if (gold < price) return;
    emit('shop:buy', { npcId: shop.npcId || 'shop-lorencia', itemId, quantity: 1 });
  };

  const handleSell = (inventoryIndex) => {
    const item = inventory[inventoryIndex];
    if (!item) return;
    const sellPrice = Math.floor((item.price || 100) * 0.5);
    emit('shop:sell', { npcId: shop.npcId || 'shop-lorencia', inventoryIndex, price: sellPrice });
  };

  const equippable = inventory.filter((item) => item.itemType !== 'consumable');

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel shop-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>{shop.npcName || 'Shop'}</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        <div className="shop-tabs">
          <button className={`shop-tab ${activeTab === 'buy' ? 'active' : ''}`} onClick={() => setActiveTab('buy')}>
            Buy
          </button>
          <button className={`shop-tab ${activeTab === 'sell' ? 'active' : ''}`} onClick={() => setActiveTab('sell')}>
            Sell
          </button>
        </div>

        <div className="gold-display">Gold: {gold}</div>

        {activeTab === 'buy' && (
          <div className="shop-items">
            {shop.items?.map((item) => (
              <div key={item.itemId} className="shop-item">
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-desc">{item.description || ''}</div>
                <div className="shop-item-stats">
                  {item.stats &&
                    Object.entries(item.stats).map(([k, v]) => (
                      <span key={k}>{k}: {v}</span>
                    ))}
                </div>
                <button
                  className="shop-buy-btn"
                  onClick={() => handleBuy(item.itemId, item.price)}
                  disabled={gold < item.price}
                >
                  Buy ({item.price} G)
                </button>
              </div>
            ))}
            {(!shop.items || shop.items.length === 0) && (
              <div className="shop-empty">No items available</div>
            )}
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="shop-items">
            {equippable.map((item, idx) => {
              const realIndex = inventory.indexOf(item);
              const sellPrice = Math.floor((item.price || 100) * 0.5);
              return (
                <div key={idx} className="shop-item">
                  <div className="shop-item-name">{item.name}</div>
                  <div className="shop-item-desc">{item.description || ''}</div>
                  <button
                    className="shop-sell-btn"
                    onClick={() => handleSell(realIndex)}
                  >
                    Sell ({sellPrice} G)
                  </button>
                </div>
              );
            })}
            {equippable.length === 0 && (
              <div className="shop-empty">Nothing to sell</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}