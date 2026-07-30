import { useState, useRef, useEffect } from 'react';
import { emit } from '../../network/SocketManager';

export default function InventoryPanel({ inventory, equipment, onClose }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleEquip = (index, slot) => {
    emit('equip:item', { inventoryIndex: index, slot });
  };

  const handleUse = (index) => {
    emit('item:use', { inventoryIndex: index });
  };

  const handleSell = (index) => {
    emit('shop:sell', { npcId: 'shop-lorencia', inventoryIndex: index });
  };

  const handleDrop = (index) => {
    emit('item:drop', { inventoryIndex: index });
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, slot) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(slot);
  };

  const handleDropOnEquip = (e, slot) => {
    e.preventDefault();
    if (dragIndex !== null) {
      handleEquip(dragIndex, slot);
    }
    setDragIndex(null);
    setDragOver(null);
  };

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  const equipSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'];

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel inventory-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Inventory ({inventory.length}/64)</h3>
          <button className="panel-close" onClick={onClose}>X</button>
        </div>

        <div className="equipment-section">
          <h4>Equipment</h4>
          <div className="equipment-grid">
            {equipSlots.map((slot) => (
              <div
                key={slot}
                className={`equip-slot ${dragOver === slot ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, slot)}
                onDrop={(e) => handleDropOnEquip(e, slot)}
              >
                <span className="slot-label">{slot}</span>
                {equipment[slot] ? (
                  <div className="item-cell equipped" title={equipment[slot].name}>
                    {equipment[slot].name}
                  </div>
                ) : (
                  <div className="item-cell empty">{slot}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="inventory-grid">
          {inventory.map((item, index) => (
            <div
              key={index}
              className={`item-cell ${item.rarity || 'normal'} ${dragIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onContextMenu={(e) => handleContextMenu(e, index)}
              title={`${item.name}\n${item.description || ''}\nDamage: ${item.stats?.damage || 0}\nRarity: ${item.rarity || 'normal'}\nRight-click for options`}
            >
              <div className="item-name">{item.name}</div>
              {item.quantity > 1 && <div className="item-stack">{item.quantity}</div>}
              <div className="item-actions">
                {item.itemType === 'consumable' ? (
                  <button onClick={() => handleUse(index)}>Use</button>
                ) : (
                  <button onClick={() => handleEquip(index, 'weapon')}>Equip</button>
                )}
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 64 - inventory.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="item-cell empty" />
          ))}
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {inventory[contextMenu.index]?.itemType !== 'consumable' && (
            <div className="context-menu-item" onClick={() => { handleEquip(contextMenu.index, 'weapon'); setContextMenu(null); }}>
              Equip
            </div>
          )}
          {inventory[contextMenu.index]?.itemType === 'consumable' && (
            <div className="context-menu-item" onClick={() => { handleUse(contextMenu.index); setContextMenu(null); }}>
              Use
            </div>
          )}
          <div className="context-menu-item" onClick={() => { handleSell(contextMenu.index); setContextMenu(null); }}>
            Sell
          </div>
          <div className="context-menu-item danger" onClick={() => { handleDrop(contextMenu.index); setContextMenu(null); }}>
            Drop
          </div>
        </div>
      )}
    </div>
  );
}