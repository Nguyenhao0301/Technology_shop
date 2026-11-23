import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById, cancelOrder } from "../api/orderApi";
import "./OrderDetail.css";
function OrderDetail() {
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getOrderById(id);

        setOrder(result.data.order);
        setItems(result.data.items || []);
      } catch (error) {
        console.error(error);
        setError(error.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setCancelError("");

      const result = await cancelOrder(id);

      setOrder(result.data.order);
      setItems(result.data.items || []);

      alert("Order cancelled successfully!");
    } catch (error) {
      console.error(error);
      setCancelError(error.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Loading order...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Chi tiết hóa đơn</h1>
        <p>{error}</p>

        <Link to="/orders">← Trở về lịch sử hóa đơn</Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main>
        <h1>Không thể tìm thấy hóa đơn</h1>

        <Link to="/orders">← Trở về lịch sử hóa đơn</Link>
      </main>
    );
  }

  return (
    <main className="order-detail-page">
      <div className="order-detail-container">
        <Link to="/orders" className="back-orders-link">
          ← Trở về lịch sử hóa đơn
        </Link>

        <div className="order-detail-header">
          <div>
            <span className="order-detail-label">Thông tin đơn hàng</span>

            <h1>Hóa đơn #{order._id.slice(-8)}</h1>

            <p>Đã đặt vào {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <span className={`order-status status-${order.status}`}>
            {order.status}
          </span>
        </div>

        <div className="order-detail-grid">
          {/* LEFT */}
          <div className="order-detail-main">
            {/* PRODUCTS */}
            <section className="order-detail-card">
              <div className="card-title">
                <h2>Sản phẩm</h2>
                <span>{items.length} Sản phẩm</span>
              </div>

              <div className="order-items-list">
                {items.map((item) => (
                  <div className="order-detail-item" key={item._id}>
                    <img
                      src={
                        item.product?.image
                          ? `http://localhost:3000/uploads/products/${item.product.image}`
                          : "/images/default-product.png"
                      }
                      alt={item.name}
                    />

                    <div className="order-detail-item-info">
                      <h3>{item.name}</h3>

                      <strong>
                        {formatPrice(item.price)} ₫ × {item.quantity}
                      </strong>
                    </div>

                    <strong>{formatPrice(item.subtotal)} ₫</strong>
                  </div>
                ))}
              </div>
            </section>

            {/* SHIPPING */}
            <section className="order-detail-card">
              <div className="card-title">
                <h2>Thông tin giao hàng</h2>
              </div>

              <div className="shipping-info">
                <div>
                  <span>Họ và tên</span>
                  <strong>{order.shippingAddress.name}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{order.shippingAddress.email}</strong>
                </div>

                <div>
                  <span>Số điện thoại</span>
                  <strong>{order.shippingAddress.phone}</strong>
                </div>

                <div>
                  <span>Địac chỉ</span>
                  <strong>{order.shippingAddress.address}</strong>
                </div>

                <div>
                  <span>Thành phố</span>
                  <strong>{order.shippingAddress.city}</strong>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="order-detail-sidebar">
            <section className="order-detail-card">
              <div className="card-title">
                <h2>Chi tiết hóa đơn</h2>
              </div>

              <div className="summary-row">
                <span>Tổng tiền</span>
                <strong>{formatPrice(order.totalAmount)} ₫</strong>
              </div>

              <div className="summary-row">
                <span>Phí giao hàng</span>
                <strong>Miễn phí</strong>
              </div>

              <div className="summary-row">
                <span>Thanh toán</span>
                <strong>
                  {{
                    cod: "Tiền mặt",
                    banking: "Chuyển khoản",
                    momo: "MoMo",
                    vnpay: "VNPay",
                  }[order.paymentMethod] || "Unknown"}
                </strong>
              </div>

              <hr />

              <div className="summary-total">
                <span>Tổng</span>
                <strong>{formatPrice(order.totalAmount)} ₫</strong>
              </div>

              {order.status === "pending" && (
                <div className="cancel-order-wrapper">
                  <button
                    className="cancel-order-btn"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>

                  {cancelError && (
                    <p className="cancel-order-error">{cancelError}</p>
                  )}
                </div>
              )}
            </section>

            <section className="order-detail-card status-card">
              <h2>Trạng thái đơn hàng</h2>

              <div className="status-timeline">
                <div
                  className={
                    order.status !== "cancelled"
                      ? "timeline-item active"
                      : "timeline-item"
                  }
                >
                  <span></span>
                  <div>
                    <strong>Đơn hàng đã được đặt</strong>
                    <p>Đơn hàng đã được nhận.</p>
                  </div>
                </div>

                <div
                  className={
                    ["confirmed", "shipping", "completed"].includes(
                      order.status,
                    )
                      ? "timeline-item active"
                      : "timeline-item"
                  }
                >
                  <span></span>
                  <div>
                    <strong>Xác nhận</strong>
                    <p>Đơn hàng của bạn đang được xử lý</p>
                  </div>
                </div>

                <div
                  className={
                    ["shipping", "completed"].includes(order.status)
                      ? "timeline-item active"
                      : "timeline-item"
                  }
                >
                  <span></span>
                  <div>
                    <strong>Giao hàng</strong>
                    <p>Đơn hàng của bạn đang được giao</p>
                  </div>
                </div>

                <div
                  className={
                    order.status === "completed"
                      ? "timeline-item active"
                      : "timeline-item"
                  }
                >
                  <span></span>
                  <div>
                    <strong>Hoàn thành</strong>
                    <p>Đơn hàng đã giao thành công</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;
