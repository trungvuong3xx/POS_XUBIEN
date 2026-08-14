import React from 'react';

export default function KitchenView({ kitchenQueue, onMarkAsDone }) {
  return (
    <div className="kitchen-container">
      <h2>Màn hình Bếp</h2>
      {kitchenQueue.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>Không có món nào đang chờ.</p>
      ) : (
        <div className="kitchen-grid">
          {kitchenQueue.map((order, idx) => (
            <div key={idx} className="kitchen-card">
              <div className="kitchen-card-header">
                <span>{order.tableName}</span>
                <span style={{color: 'var(--text-secondary)', fontSize:'12px'}}>
                  {new Date(order.time).toLocaleTimeString()}
                </span>
              </div>
              <div>
                {order.items.map((item, i) => (
                  <div key={i} className="kitchen-item-wrapper">
                    <div className="kitchen-item">
                      <span className="kitchen-item-name">{item.quantity}x {item.name}</span>
                      <button className="btn-done" onClick={() => onMarkAsDone(order.id, item.id)}>XONG</button>
                    </div>
                    {item.note && (
                      <div className="kitchen-item-note">📝 {item.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
