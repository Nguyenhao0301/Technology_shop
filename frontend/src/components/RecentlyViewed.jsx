import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
} from "../utils/recentlyViewed";
import "./RecentlyViewed.css";

function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const updateProducts = () => {
      setProducts(getRecentlyViewed());
    };

    updateProducts();

    window.addEventListener("recentlyViewedUpdated", updateProducts);

    return () => {
      window.removeEventListener("recentlyViewedUpdated", updateProducts);
    };
  }, []);

  if (products.length === 0) {
    return null;
  }

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + "₫";

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-header">
        <div>
          <span className="recently-viewed-label">Lịch sử đã xem</span>
          <h2>Sản phẩm đã xem</h2>
          <p>Tiếp tục khám phá những sản phẩm bạn quan tâm.</p>
        </div>

        <button
          className="clear-recently-viewed"
          onClick={() => {
            clearRecentlyViewed();
            setProducts([]);
          }}
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="recently-viewed-list">
        {products.map((product) => (
          <Link
            to={`/products/${product._id}`}
            className="recently-viewed-card"
            key={product._id}
          >
            <div className="recently-viewed-image">
              <img
                src={
                  product.image
                    ? `http://localhost:3000/uploads/products/${product.image}`
                    : "/images/product-placeholder.jpg"
                }
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/product-placeholder.jpg";
                }}
              />
            </div>

            <div className="recently-viewed-info">
              {product.brand && (
                <span className="recently-viewed-brand">{product.brand}</span>
              )}

              <h3>{product.name}</h3>

              <div className="recently-viewed-price">
                {product.discountPrice != null &&
                Number(product.discountPrice) > 0 &&
                Number(product.discountPrice) < Number(product.price) ? (
                  <>
                    <strong>{formatPrice(product.discountPrice)}</strong>
                    <del>{formatPrice(product.price)}</del>
                  </>
                ) : (
                  <strong>{formatPrice(product.price)}</strong>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;
