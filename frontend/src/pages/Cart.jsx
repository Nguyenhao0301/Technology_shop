import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, saveCart } from "../utils/cart";
import "./Cart.css";
const formatVND = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) => {
      if (item.productId === productId) {
        if (item.quantity >= item.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });

    setCart(updatedCart);
    saveCart(updatedCart);

    window.dispatchEvent(new Event("cartChanged"));
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart.map((item) => {
      if (item.productId === productId && item.quantity > 1) {
        return {
          ...item,
          quantity: item.quantity - 1,
        };
      }

      return item;
    });

    setCart(updatedCart);
    saveCart(updatedCart);

    window.dispatchEvent(new Event("cartChanged"));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);

    setCart(updatedCart);
    saveCart(updatedCart);

    window.dispatchEvent(new Event("cartChanged"));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h1>Giỏ hàng đang trống</h1>

          <p>Bạn vẫn chưa thêm sản phẩm nào vào giỏ hàng.</p>

          <Link to="/products">← Tiếp tục mua sắp</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1>Giỏ hàng</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.productId}>
                <img src={`/products/${item.image}`} alt={item.name} />

                <div className="cart-item-info">
                  <h2>{item.name}</h2>

                  <p>{formatVND(item.price)}</p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => decreaseQuantity(item.productId)}>
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item.productId)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.productId)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <strong className="cart-item-total">
                  {formatVND(item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Chi tiết đơn hàng</h2>

            <div className="summary-row">
              <span>Tổng tiền</span>

              <strong>{formatVND(total)}</strong>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>

              <strong>Miễn phí</strong>
            </div>

            <hr />

            <div className="summary-total">
              <span>Tổng</span>

              <strong>{formatVND(total)}</strong>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Thanh toán
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Cart;
