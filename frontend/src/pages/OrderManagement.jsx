import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../api/orderApi";
import "./OrderManagement.css";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllOrders();

      setOrders(result.data || []);
    } catch (error) {
      console.error("Get all orders error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError("");

      await updateOrderStatus(orderId, status);

      await fetchOrders();
    } catch (error) {
      console.error("Update order status error:", error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case "pending":
        return "confirmed";

      case "confirmed":
        return "shipping";

      case "shipping":
        return "completed";

      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "confirmed":
        return "Confirmed";

      case "shipping":
        return "Shipping";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  if (loading) {
    return (
      <main className="order-management-page">
        <div className="order-management-container">
          <div className="order-loading">Loading orders...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-management-page">
      <div className="order-management-container">
        <div className="order-management-header">
          <div>
            <h1>Quản lí hóa đơn</h1>
            <p>Quản lí hóa đơn khách hàng và cập nhập trạng thái đơn hàng.</p>
          </div>

          <div className="order-count">{orders.length} Hóa đơn</div>
        </div>

        {error && <div className="order-error">{error}</div>}

        {!error && orders.length === 0 && (
          <div className="empty-orders">
            <h2>Không tìm thấy hóa đơn</h2>
            <p>Không có hóa đơn nào nào để hiển thị</p>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((orderData) => {
              const order = orderData.order;
              const items = orderData.items || [];
              const nextStatus = getNextStatus(order.status);

              return (
                <div className="order-card" key={order._id}>
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-label">Hóa đơn</span>

                      <h2>#{order._id}</h2>
                    </div>

                    <span className={`order-status status-${order.status}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="order-section">
                    <h3>Thông tin khách hàng</h3>

                    <div className="customer-info">
                      <div>
                        <span>Họ và tên</span>
                        <strong>{order.user?.name || "Unknown"}</strong>
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>{order.user?.email || "N/A"}</strong>
                      </div>

                      <div>
                        <span>Số điện thoại</span>
                        <strong>{order.user?.phone || "N/A"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="order-section">
                    <h3>Thông tin hóa đơn</h3>

                    <div className="order-info">
                      <div>
                        <span>Ngày hóa đơn</span>

                        <strong>
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </strong>
                      </div>

                      <div>
                        <span>Thanh toán</span>

                        <strong>
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Banking"}
                        </strong>
                      </div>

                      <div>
                        <span>Tổng</span>

                        <strong className="order-total">
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="order-section">
                    <h3>Sản phẩm</h3>

                    <div className="order-products">
                      {items.map((item) => (
                        <div className="order-product" key={item._id}>
                          <div className="product-info">
                            <strong>{item.name}</strong>

                            <span>Số lượng: {item.quantity}</span>
                          </div>

                          <strong>{formatPrice(item.subtotal)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="order-card-footer">
                    <div className="status-flow">
                      <span>{getStatusText(order.status)}</span>

                      {nextStatus && (
                        <>
                          <span className="arrow">→</span>

                          <span>{getStatusText(nextStatus)}</span>
                        </>
                      )}
                    </div>

                    {nextStatus && (
                      <button
                        className="update-status-button"
                        onClick={() =>
                          handleUpdateStatus(order._id, nextStatus)
                        }
                        disabled={updatingId === order._id}
                      >
                        {updatingId === order._id
                          ? "Updating..."
                          : `Change to ${getStatusText(nextStatus)}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default OrderManagement;
