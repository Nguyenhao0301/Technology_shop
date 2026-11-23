import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";
import "./Orders.css";

function Orders() {
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getMyOrders();

        console.log("MY ORDERS RESULT:", result);

        setOrders(result.data || []);
      } catch (error) {
        console.error("Get my orders error:", error);

        setError(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-message">
          <div className="orders-spinner"></div>

          <h1>Loading Orders...</h1>

          <p>Please wait while we load your orders.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="orders-message">
          <h1>Tải hóa đơn thất bại</h1>

          <p>{error}</p>

          <Link to="/">← Trở về trang chủ</Link>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <div className="orders-message">
          <h1>Không có hóa đơn nào</h1>

          <p>Bạn chưa có hóa đơn đã đặt nào</p>

          <Link to="/products">← Bắt đầu mua sắp</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <span className="orders-label">Tài khoản</span>

            <h1>Hóa đơn của tôi</h1>

            <p>Xem lịch sử hóa đơn đã mua</p>
          </div>
        </div>

        <div className="orders-list">
          {orders.map((orderData) => {
            const order = orderData.order;
            const items = orderData.items || [];

            return (
              <div className="order-card" key={order._id}>
                {/* ORDER HEADER */}

                <div className="order-card-header">
                  <div>
                    <span className="order-label">Hóa đơn</span>

                    <h2>#{order._id}</h2>
                  </div>

                  <span className={`order-status ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                {/* ORDER DATE */}

                <div className="order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>

                {/* ITEMS */}

                <div className="order-items">
                  {items.map((item) => (
                    <div className="order-item" key={item._id}>
                      <div className="order-item-image">
                        <img
                          src={`/products/${item.product?.image}`}
                          alt={item.name}
                        />
                      </div>

                      <div className="order-item-info">
                        <h3>{item.name}</h3>

                        <p>
                          {formatPrice(item.price)} ₫ × {item.quantity}
                        </p>
                      </div>

                      <strong>{formatPrice(item.subtotal)} ₫</strong>
                    </div>
                  ))}
                </div>

                {/* ORDER FOOTER */}

                <div className="order-card-footer">
                  <div>
                    <span>Tổng</span>

                    <strong>{formatPrice(order.totalAmount)} ₫</strong>
                  </div>

                  <Link to={`/orders/${order._id}`} className="view-order-btn">
                    Xem hóa đơn →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Orders;
