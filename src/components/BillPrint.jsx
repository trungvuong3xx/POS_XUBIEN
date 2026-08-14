import React from 'react';

const formatMoney = (amount) => amount.toLocaleString('vi-VN') + ' đ';

export default function BillPrint({ cart, tableName, totalAmount }) {
  if (!cart || cart.length === 0) return null;

  return (
    <div className="bill-print">
      <div className="bill-header">
        <div className="bill-title">NHÀ HÀNG XUBIEN</div>
        <div>Đ/c: 123 Đường ABC, Hà Nội</div>
        <div>SĐT: 0123 456 789</div>
        <div style={{marginTop: '10px', fontWeight: 'bold'}}>PHIẾU THANH TOÁN</div>
        <div>{tableName}</div>
        <div>Ngày: {new Date().toLocaleString('vi-VN')}</div>
      </div>
      
      <div style={{marginBottom: '10px'}}>
        {cart.map((item, idx) => (
          <div key={idx} className="bill-item">
            <div>
              <div>{item.name}</div>
              <div style={{fontSize: '12px'}}>{item.quantity} x {formatMoney(item.price)}</div>
            </div>
            <div>{formatMoney(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="bill-total">
        <span>TỔNG CỘNG:</span>
        <span>{formatMoney(totalAmount)}</span>
      </div>
      
      <div style={{textAlign: 'center', marginTop: '20px', fontSize: '12px'}}>
        Cảm ơn Quý khách & Hẹn gặp lại!
      </div>
    </div>
  );
}
