import { useState, useEffect } from 'react';
import './index.css';

// Dữ liệu mẫu (nếu chưa gọi được API từ Google Sheets)
const MOCK_DATA = [
  { id: 1, name: "Phở bò", price: 45000 },
  { id: 2, name: "Bún chả Hà Nội", price: 40000 },
  { id: 3, name: "Cơm tấm sườn bì chả", price: 50000 },
  { id: 4, name: "Bánh mì chảo", price: 35000 },
  { id: 5, name: "Bún bò Huế", price: 45000 },
  { id: 6, name: "Hủ tiếu Nam Vang", price: 40000 },
  { id: 7, name: "Bánh xèo miền Tây", price: 50000 },
  { id: 8, name: "Mì Quảng", price: 45000 },
  { id: 9, name: "Bún đậu mắm tôm", price: 40000 },
  { id: 10, name: "Gỏi cuốn (3 cuốn)", price: 25000 },
  { id: 11, name: "Bánh cuốn nhân thịt", price: 35000 },
  { id: 12, name: "Cơm chiên Dương Châu", price: 45000 },
  { id: 13, name: "Chả cá Lã Vọng", price: 90000 },
  { id: 14, name: "Bún riêu cua", price: 35000 },
  { id: 15, name: "Nem nướng Nha Trang", price: 50000 },
  { id: 16, name: "Bánh canh cua", price: 45000 },
  { id: 17, name: "Bún thịt nướng", price: 35000 },
  { id: 18, name: "Cơm gà xối mỡ", price: 40000 },
  { id: 19, name: "Lẩu Thái hải sản", price: 150000 },
  { id: 20, name: "Chè thập cẩm", price: 20000 }
];

// Định dạng tiền tệ VNĐ
const formatMoney = (amount) => {
  return amount.toLocaleString('vi-VN') + ' đ';
};

function App() {
  const [products, setProducts] = useState(MOCK_DATA);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Link Web App của Google Apps Script (Bạn cần thay thế link này sau khi deploy)
  const API_URL = ''; 

  useEffect(() => {
    if (API_URL) {
      setIsLoading(true);
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setProducts(data.data);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tải menu:", err);
          setIsLoading(false);
        });
    }
  }, []);

  // Lọc sản phẩm theo tìm kiếm
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thêm vào giỏ hàng
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Xóa khỏi giỏ hàng
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Tính tổng tiền
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Xử lý thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (!API_URL) {
      alert("Đã thanh toán (Chế độ Demo):\nTổng tiền: " + formatMoney(totalAmount));
      setCart([]);
      return;
    }

    const payload = {
      items: cart,
      total: totalAmount
    };

    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Thanh toán thành công! Mã HĐ: " + data.orderId);
        setCart([]); // Xóa giỏ hàng
      } else {
        alert("Có lỗi xảy ra: " + data.error);
      }
    })
    .catch(err => {
      alert("Lỗi kết nối đến Google Sheets");
      console.error(err);
    });
  };

  return (
    <div className="pos-container">
      {/* Cột trái: Danh sách sản phẩm */}
      <div className="left-panel">
        <div className="header">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="🔍 Tìm mặt hàng (F3)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="products-area">
          {isLoading ? (
            <div className="loading-state">Đang tải dữ liệu từ Google Sheets...</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => addToCart(product)}
                >
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">{formatMoney(product.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Hóa đơn */}
      <div className="right-panel">
        <div className="cart-header">
          <span>Hóa đơn mới</span>
          <span style={{color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'normal'}}>
            {totalItems} món
          </span>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">Chưa có món nào được chọn.</div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} className="cart-item">
                <div className="item-index">{index + 1}</div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">{formatMoney(item.price)}</div>
                </div>
                <div className="item-controls">
                  <button className="btn-qty" onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <div className="item-qty">{item.quantity}</div>
                  <button className="btn-qty" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="item-total">
                  {formatMoney(item.price * item.quantity)}
                </div>
                <button className="btn-delete" onClick={() => removeFromCart(item.id)}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="summary-row">
            <span>Tổng tiền hàng</span>
            <span>{formatMoney(totalAmount)}</span>
          </div>
          <div className="summary-row">
            <span>Giảm giá</span>
            <span>0 đ</span>
          </div>
          <div className="summary-row total">
            <span>Khách cần trả</span>
            <span>{formatMoney(totalAmount)}</span>
          </div>
          
          <button 
            className="btn-checkout" 
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            THANH TOÁN (F9)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
