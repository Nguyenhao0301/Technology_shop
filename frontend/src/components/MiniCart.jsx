import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart } from "../utils/cart";
import "./MiniCart.css";

function MiniCart() {
  const [cart, setCart] = useState(getCart);

  useEffect(() => {
    const updateCart = () => setCart(getCart());

    window.addEventListener("cartChanged", updateCart);

    return () => window.removeEventListener("cartChanged", updateCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mini-cart-wrapper">
      <Link to="/cart" className="nav-action cart-action" aria-label="Shopping cart">
        <svg viewBox="0 0 24 24" className="nav-icon">
          <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
        <span className="cart-badge">{itemCount}</span>
      </Link>

      <div className="mini-cart" role="status">
        <div className="mini-cart-header">
          <strong>Giỏ hàng</strong>
          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        </div>

        {cart.length === 0 ? (
          <p className="mini-cart-empty">Giỏ hàng đang trống.</p>
        ) : (
          <>
            <div className="mini-cart-items">
              {cart.map((item) => (
                <div className="mini-cart-item" key={item.productId}>
                  <img src={`/products/${item.image}`} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} × ${item.price.toLocaleString()}</span>
                  </div>
                  <b>${(item.price * item.quantity).toLocaleString()}</b>
                </div>
              ))}
            </div>

            <div className="mini-cart-total">
              <span>Tổng</span>
              <strong>${total.toLocaleString()}</strong>
            </div>
            <Link to="/cart" className="mini-cart-button">Xem giỏ hàng và thanh toán</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default MiniCart;
