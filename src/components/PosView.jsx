import React, { useState } from 'react';
import BillPrint from './BillPrint';

const formatMoney = (amount) => amount.toLocaleString('vi-VN') + ' đ';

export default function PosView({ 
  products, 
  cart, 
  currentTable, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onSendToKitchen, 
  onCheckout 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Extract unique categories
  const categories = ['Tất cả', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle Checkout Click
  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const handlePrintAndFinish = () => {
    window.print();
    onCheckout();
    setShowCheckoutModal(false);
  };

  // VietQR URL builder (using a demo generic account)
  const bankId = "970415"; // Vietinbank
  const accountNo = "113366668888";
  const accountName = "NGUYEN VAN A";
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=Thanh toan ${currentTable?.name}&accountName=${accountName}`;

  return (
    <div className="pos-container">
      {/* Cột trái: Danh sách sản phẩm */}
      <div className="left-panel no-print">
        <div className="header">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="🔍 Tìm món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ padding: '0 16px' }}>
          <div className="category-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="products-area">
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => onAddToCart(product)}
              >
                <div className="product-name">{product.name}</div>
                <div className="product-price">{formatMoney(product.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Hóa đơn */}
      <div className="right-panel no-print">
        <div className="cart-header">
          <span>{currentTable ? currentTable.name : 'Chưa chọn bàn'}</span>
          <span style={{color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'normal'}}>
            {totalItems} món
          </span>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Bàn này chưa gọi món nào.</div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} className="cart-item">
                <div className="item-index">{index + 1}</div>
                <div className="item-info">
                  <div className="item-name">
                    {item.name} {item.sentToKitchen && <span style={{color:'green', fontSize:'12px'}}>✓</span>}
                  </div>
                  <div className="item-price">{formatMoney(item.price)}</div>
                </div>
                <div className="item-controls">
                  <button className="btn-qty" onClick={() => onUpdateQuantity(item.id, -1)}>−</button>
                  <div className="item-qty">{item.quantity}</div>
                  <button className="btn-qty" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="item-total">
                  {formatMoney(item.price * item.quantity)}
                </div>
                <button className="btn-delete" onClick={() => onRemoveFromCart(item.id)}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{formatMoney(totalAmount)}</span>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-kitchen" 
              disabled={cart.length === 0}
              onClick={onSendToKitchen}
            >
              GỬI BẾP
            </button>
            <button 
              className="btn-checkout" 
              disabled={cart.length === 0}
              onClick={handleCheckoutClick}
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thanh toán & QR */}
      {showCheckoutModal && (
        <div className="modal-overlay no-print">
          <div className="modal-content">
            <h3>Thanh toán {currentTable?.name}</h3>
            <p style={{fontSize:'20px', fontWeight:'bold', color:'var(--danger-color)', margin:'10px 0'}}>
              {formatMoney(totalAmount)}
            </p>
            <p style={{fontSize:'14px', color:'var(--text-secondary)'}}>Khách quét mã để chuyển khoản</p>
            
            <img src={qrUrl} alt="VietQR" className="qr-code-img" />
            
            <div style={{display:'flex', gap:'8px'}}>
              <button 
                className="btn-print" 
                style={{background: 'var(--text-secondary)'}}
                onClick={() => setShowCheckoutModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-print" 
                onClick={handlePrintAndFinish}
              >
                In Bill & Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giao diện Bill để In */}
      <div className="print-area">
        <BillPrint 
          cart={cart} 
          tableName={currentTable?.name} 
          totalAmount={totalAmount} 
        />
      </div>
    </div>
  );
}
