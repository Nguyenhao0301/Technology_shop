import { Link } from "react-router-dom";
import { useState } from "react";
import { addToCart } from "../utils/cart";
import { isInWishlist, toggleWishlist } from "../utils/wishlist";
import "./ProductCard.css";

function formatVND(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    return "Chưa có giá";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductCard({ product, showSoldCount = false }) {
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const wishlisted = wishlistVersion >= 0 && isInWishlist(product._id);

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
    setWishlistVersion((version) => version + 1);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-image">
        <img
          src={
            product.image
              ? `http://localhost:3000/uploads/products/${product.image}`
              : "/images/product-placeholder.jpg"
          }
          alt={product.name}
        />

        <button
          className={`wishlist-btn${wishlisted ? " active" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={handleWishlist}
        >
          {wishlisted ? "♥" : "♡"}
        </button>

        <button
          className="quick-view-btn"
          aria-label="Quick view"
          onClick={(event) => event.preventDefault()}
        >
          👁
        </button>

        {product.stock > 0 ? (
          <span className="stock-badge">Còn hàng</span>
        ) : (
          <span className="stock-badge out">Hết hàng</span>
        )}
      </Link>

      <div className="product-card-content">
        <span className="product-brand">{product.brand?.name}</span>

        <Link to={`/products/${product._id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-value">5.0</span>
          <span className="review-count">(0)</span>
        </div>

        <div className="product-sold">Còn: {product.stock}</div>

        {showSoldCount && product.totalSold !== undefined && (
          <p className="product-sold-count">🔥 Đã bán: {product.totalSold}</p>
        )}

        <div className="product-bottom">
          <span className="product-price">{formatVND(product.price)}</span>

          <button
            className="add-cart-btn"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            Thêm giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
