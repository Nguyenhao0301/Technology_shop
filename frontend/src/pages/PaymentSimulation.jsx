import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, simulatePayment } from "../api/orderApi";
import "./PaymentSimulation.css";

const formatVND = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

function PaymentSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const result = await getOrderById(id);
        const orderData = result.data?.order || result.order || result.data;

        if (!orderData) {
          throw new Error("Không tìm thấy thông tin đơn hàng.");
        }

        if (!["momo", "vnpay"].includes(orderData.paymentMethod)) {
          navigate(`/orders/${id}`, { replace: true });
          return;
        }

        if (orderData.paymentStatus !== "pending") {
          navigate(`/orders/${id}`, { replace: true });
          return;
        }

        setOrder(orderData);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  const handlePayment = async (result) => {
    if (processing) return;

    try {
      setProcessing(true);
      setError("");

      await simulatePayment(id, result);

      if (result === "success") {
        navigate(`/orders/${id}`);
      } else {
        setError(
          "Thanh toán thất bại. Đơn hàng chưa được thanh toán. Bạn có thể thử lại.",
        );
      }
    } catch (err) {
      setError(err.message || "Không thể xử lý thanh toán.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="payment-page">Đang tải thông tin thanh toán...</main>
    );
  }

  if (error && !order) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>Không thể mở trang thanh toán</h1>
          <p className="payment-error">{error}</p>
          <button onClick={() => navigate("/orders")}>Xem đơn hàng</button>
        </div>
      </main>
    );
  }

  if (!order) return null;

  const isMomo = order.paymentMethod === "momo";

  return (
    <main className="payment-page">
      <section className="payment-card">
        <div className={`payment-logo ${isMomo ? "momo" : "vnpay"}`}>
          {isMomo ? "MoMo" : "VNPay"}
        </div>

        <h1>Thanh toán đơn hàng</h1>
        <p className="payment-description">
          Đây là trang thanh toán mô phỏng phục vụ kiểm thử website. Không có
          giao dịch tiền thật được thực hiện.
        </p>

        <div className="payment-order-info">
          <div>
            <span>Mã đơn hàng</span>
            <strong>{order._id}</strong>
          </div>

          <div>
            <span>Phương thức</span>
            <strong>{isMomo ? "MoMo" : "VNPay"}</strong>
          </div>

          <div>
            <span>Tổng thanh toán</span>
            <strong className="payment-amount">
              {formatVND(order.totalAmount)}
            </strong>
          </div>
        </div>

        {error && <p className="payment-error">{error}</p>}

        <div className="payment-actions">
          <button
            className="payment-success-btn"
            disabled={processing}
            onClick={() => handlePayment("success")}
          >
            {processing ? "Đang xử lý..." : "Thanh toán thành công"}
          </button>

          <button
            className="payment-failure-btn"
            disabled={processing}
            onClick={() => handlePayment("failure")}
          >
            Thanh toán thất bại
          </button>
        </div>

        <button
          className="payment-back-btn"
          disabled={processing}
          onClick={() => navigate(`/orders/${id}`)}
        >
          Quay lại chi tiết đơn hàng
        </button>
      </section>
    </main>
  );
}

export default PaymentSimulation;
