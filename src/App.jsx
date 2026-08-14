import { useState } from 'react';
import './index.css';

import TableMap from './components/TableMap';
import PosView from './components/PosView';
import KitchenView from './components/KitchenView';

// Dữ liệu mẫu CÓ THÊM PHÂN LOẠI
const MOCK_DATA = [
  { id: 1, name: "Phở bò", price: 45000, category: "Đồ ăn" },
  { id: 2, name: "Bún chả Hà Nội", price: 40000, category: "Đồ ăn" },
  { id: 3, name: "Cơm tấm sườn bì chả", price: 50000, category: "Đồ ăn" },
  { id: 19, name: "Lẩu Thái hải sản", price: 150000, category: "Đồ ăn" },
  { id: 20, name: "Chè thập cẩm", price: 20000, category: "Tráng miệng" },
  { id: 21, name: "Cà phê sữa đá", price: 25000, category: "Đồ uống" },
  { id: 22, name: "Trà đào cam sả", price: 35000, category: "Đồ uống" },
  { id: 23, name: "Sinh tố bơ", price: 40000, category: "Đồ uống" },
];

const INIT_TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: `T${i + 1}`,
  name: `Bàn ${i + 1}`
}));

function App() {
  const [view, setView] = useState('table-map'); // 'table-map', 'pos', 'kitchen'
  
  const [products] = useState(MOCK_DATA);
  const [tables] = useState(INIT_TABLES);
  
  const [currentTableId, setCurrentTableId] = useState(null);
  
  // State lưu giỏ hàng của từng bàn: { "T1": [...], "T2": [...] }
  const [orders, setOrders] = useState({});
  
  // Hàng chờ gửi Bếp
  const [kitchenQueue, setKitchenQueue] = useState([]);

  // --- POS Logic ---
  const currentCart = currentTableId && orders[currentTableId] ? orders[currentTableId] : [];

  const updateCart = (newCart) => {
    if (!currentTableId) return;
    setOrders(prev => ({
      ...prev,
      [currentTableId]: newCart
    }));
  };

  const handleAddToCart = (product) => {
    if (!currentTableId) {
      alert("Vui lòng chọn bàn trước khi gọi món!");
      return;
    }
    const existing = currentCart.find(item => item.id === product.id);
    if (existing) {
      updateCart(currentCart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      updateCart([...currentCart, { ...product, quantity: 1, sentToKitchen: false }]);
    }
  };

  const handleUpdateQuantity = (id, delta) => {
    updateCart(currentCart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id) => {
    updateCart(currentCart.filter(item => item.id !== id));
  };

  const handleSendToKitchen = () => {
    if (currentCart.length === 0) return;
    
    // Lọc các món chưa gửi bếp
    const unsentItems = currentCart.filter(item => !item.sentToKitchen);
    if (unsentItems.length === 0) {
      alert("Tất cả các món đã được gửi bếp rồi!");
      return;
    }

    const currentTable = tables.find(t => t.id === currentTableId);
    
    const newOrder = {
      id: Date.now(),
      tableId: currentTableId,
      tableName: currentTable.name,
      time: new Date().toISOString(),
      items: unsentItems.map(item => ({ ...item }))
    };

    setKitchenQueue(prev => [...prev, newOrder]);
    
    // Đánh dấu đã gửi bếp trong giỏ
    updateCart(currentCart.map(item => ({ ...item, sentToKitchen: true })));
    alert("Đã gửi order xuống bếp!");
  };

  const handleCheckout = () => {
    // Xóa giỏ hàng của bàn này
    const newOrders = { ...orders };
    delete newOrders[currentTableId];
    setOrders(newOrders);
    setCurrentTableId(null);
    setView('table-map');
  };

  // --- Kitchen Logic ---
  const handleMarkAsDone = (orderId, itemId) => {
    setKitchenQueue(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.filter(i => i.id !== itemId)
        };
      }
      return order;
    }).filter(order => order.items.length > 0)); // Xóa order nếu không còn món nào
  };

  const currentTable = tables.find(t => t.id === currentTableId);

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <div className="top-nav no-print">
        <div className="nav-brand">XUBIEN POS</div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${view === 'table-map' ? 'active' : ''}`}
            onClick={() => setView('table-map')}
          >
            Sơ đồ bàn
          </button>
          <button 
            className={`nav-tab ${view === 'pos' ? 'active' : ''}`}
            onClick={() => setView('pos')}
          >
            Bán hàng (POS)
          </button>
          <button 
            className={`nav-tab ${view === 'kitchen' ? 'active' : ''}`}
            onClick={() => setView('kitchen')}
          >
            Bếp
            {kitchenQueue.length > 0 && <span style={{marginLeft: '4px', background:'red', color:'white', borderRadius:'50%', padding:'2px 6px', fontSize:'12px'}}>{kitchenQueue.reduce((a, b) => a + b.items.length, 0)}</span>}
          </button>
        </div>
      </div>

      <div className="main-content">
        {view === 'table-map' && (
          <TableMap 
            tables={tables}
            currentTableId={currentTableId}
            onSelectTable={(id) => {
              setCurrentTableId(id);
              setView('pos');
            }}
            orders={orders}
          />
        )}

        {view === 'pos' && (
          <PosView 
            products={products}
            cart={currentCart}
            currentTable={currentTable}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onSendToKitchen={handleSendToKitchen}
            onCheckout={handleCheckout}
          />
        )}

        {view === 'kitchen' && (
          <KitchenView 
            kitchenQueue={kitchenQueue}
            onMarkAsDone={handleMarkAsDone}
          />
        )}
      </div>
    </div>
  );
}

export default App;
