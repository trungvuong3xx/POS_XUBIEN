import React from 'react';

export default function TableMap({ tables, currentTableId, onSelectTable, orders }) {
  return (
    <div className="table-map-container">
      <h2>Sơ đồ bàn</h2>
      <div className="table-grid">
        {tables.map(table => {
          const tableOrder = orders[table.id] || [];
          const totalAmount = tableOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const isActive = table.id === currentTableId;
          const hasGuests = totalAmount > 0;

          return (
            <div 
              key={table.id} 
              className={`table-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTable(table.id)}
            >
              <div className="table-name">{table.name}</div>
              <div className="table-status">
                {hasGuests ? 'Đang phục vụ' : 'Trống'}
              </div>
              {hasGuests && (
                <div className="table-amount">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
