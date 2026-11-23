import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, clearCart } from "../utils/cart";
import { createOrder, simulatePayment } from "../api/orderApi";
import { getMyVouchers } from "../api/voucherApi";
import "./Checkout.css";
const formatVND = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [myVouchers, setMyVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    const cartData = getCart();

    console.log("CART DATA:", JSON.stringify(cartData, null, 2));

    setCart(cartData);

    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);

      setUser(parsedUser);
      

      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: "",
        city: "",
      });
    }
  }, []);

  useEffect(() => {
    const fetchMyVouchers = async () => {
      try {
        setVoucherLoading(true);
        const data = await getMyVouchers();
        console.log("MY VOUCHERS:", data);
        setMyVouchers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load vouchers error:", error);
      } finally {
        setVoucherLoading(false);
      }
    };

    fetchMyVouchers();
  }, []);

  // Xử lý khi người dùng nhập dữ liệu
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedVoucher = myVouchers.find((item) => item.code === voucherCode);

  const voucherInfo = selectedVoucher?.voucher;

  const voucherEligible =
    selectedVoucher?.status === "available" &&
    selectedVoucher?.expiresAt &&
    new Date(selectedVoucher.expiresAt) > new Date() &&
    voucherInfo?.isActive !== false &&
    total >= (voucherInfo?.minOrderAmount || 0) &&
    voucherInfo?.startAt &&
    new Date(voucherInfo.startAt) <= new Date() &&
    voucherInfo?.endAt &&
    new Date(voucherInfo.endAt) > new Date();

  let discountAmount = 0;

  if (voucherCode && voucherEligible && voucherInfo) {
    if (voucherInfo.discountType === "fixed") {
      discountAmount = voucherInfo.discountValue;
    } else if (voucherInfo.discountType === "percentage") {
      discountAmount = (total * voucherInfo.discountValue) / 100;
    }

    if (voucherInfo.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, voucherInfo.maxDiscountAmount);
    }

    discountAmount = Math.round(Math.min(discountAmount, total));
  }

  const finalTotal = total - discountAmount;

  // Xử lý đặt hàng
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setCheckoutError("");

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }
    console.log("FORM DATA:", formData);
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim()
    ) {
      setCheckoutError("Please complete all shipping information.");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      setCheckoutError("Please enter a valid phone number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),

        shippingAddress: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
        },

        paymentMethod: paymentMethod,
        voucherCode: voucherCode || null,
      };

      const result = await createOrder(orderData);
      const orderId = result.data.order._id;

      if (paymentMethod === "momo" || paymentMethod === "vnpay") {
        clearCart();
        navigate(`/payment/${orderId}`);
        return;
      }

      clearCart();

      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(error.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu giỏ hàng trống
  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Giỏ hàng đang trống</h1>

          <p>Hãy thêm sản phẩm trước khi thanh toán</p>

          <Link to="/products">← Tiếp tục mua sắp</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Thanh toán</h1>

          <p>Vui lòng điền đầy đủ thông tin</p>
        </div>

        <div className="checkout-layout">
          {/* FORM THÔNG TIN GIAO HÀNG */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>thông tin giao hàng</h2>

            <div className="form-group">
              <label>Họ và tên</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="form-group">
              <label>Thành phố</label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="payment-method-group">
              <h3>Phương thức thanh toán</h3>

              <label
                className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <span className="payment-option-icon">💵</span>

                <span className="payment-option-info">
                  <strong>Tiền mặt</strong>
                  <small>Thanh toán trực tiếp khi đơn đã giao thành công</small>
                </span>
              </label>

              <label
                className={`payment-option ${paymentMethod === "banking" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="banking"
                  checked={paymentMethod === "banking"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <span className="payment-option-icon">🏦</span>

                <span className="payment-option-info">
                  <strong>Chuyển khoản</strong>
                  <small>Chuyển khoản ngân hàng</small>
                </span>
              </label>

              {/* MoMo */}
              <label
                className={`payment-option ${paymentMethod === "momo" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <span className="payment-option-icon">🩷</span>

                <span className="payment-option-info">
                  <strong>MoMo</strong>
                  <small>Thanh toán qua ví điệnt ử MoMo</small>
                </span>
              </label>

              {/* VNPay */}
              <label
                className={`payment-option ${paymentMethod === "vnpay" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <span className="payment-option-icon">💳</span>

                <span className="payment-option-info">
                  <strong>VNPay</strong>
                  <small>Thanh toán qua ví điệnt ử VNPay</small>
                </span>
              </label>
            </div>

            {checkoutError && (
              <p className="checkout-error" role="alert">
                {checkoutError}
              </p>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang thanh toán... " : "Thanh toán"}
            </button>
          </form>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="checkout-summary">
            <h2>Hóa đơn</h2>

            <div className="checkout-voucher">
              <label htmlFor="voucherCode">Voucher của bạn</label>

              <select
                id="voucherCode"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={voucherLoading}
              >
                <option value="">
                  {voucherLoading
                    ? "Đang tải voucher..."
                    : "Không sử dụng voucher"}
                </option>

                {myVouchers
                  .filter(
                    (item) =>
                      item.status === "available" &&
                      new Date(item.expiresAt) > new Date(),
                  )
                  .map((item) => (
                    <option key={item._id} value={item.code}>
                      {item.voucher.name} — {item.code}
                    </option>
                  ))}
              </select>
            </div>

            <div className="checkout-items">
              {cart.map((item) => (
                <div className="checkout-item" key={item.productId}>
                  <img src={`/products/${item.image}`} alt={item.name} />

                  <div className="checkout-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      {formatVND(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <strong>{formatVND(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-row">
              <span>Tổng tiền</span>

              <strong>{formatVND(total)}</strong>
            </div>

            {voucherCode && (
              <div className="checkout-summary-row">
                <span>Giảm giá voucher</span>
                <strong>
                  {discountAmount > 0
                    ? `-${formatVND(discountAmount)}`
                    : "Chưa đủ điều kiện"}
                </strong>
              </div>
            )}

            <div className="checkout-summary-row">
              <span>Phí vận chuyển</span>

              <strong>Miễn phí</strong>
            </div>

            <hr />

            <div className="checkout-total">
              <span>Tổng thanh toán</span>
              <strong>{formatVND(finalTotal)}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
