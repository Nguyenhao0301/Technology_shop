import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, ShoppingCart, Heart } from "lucide-react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../utils/cart";
import "./FlashSale.css";

function FlashSale() {
  const [products, setProducts] = useState([]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 23,
    seconds: 19,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();

        if (response.data && response.data.length > 0) {
          setProducts(response.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching flash sale products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            ...prev,
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return {
          hours: 23,
          minutes: 59,
          seconds: 59,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flash-sale-section">
      <div className="flash-sale-container">
        {/* TIÊU ĐỀ */}
        <div className="flash-sale-header">
          <div className="flash-sale-heading">
            <span className="flash-sale-label">
              <span className="flash-sale-dot"></span>
              Ưu đãi đặc biệt
            </span>

            <h2>
              Ưu đãi <span>có thời hạn</span>
            </h2>
          </div>

          <div className="flash-sale-actions">
            <div className="flash-countdown">
              <Clock3 size={16} />

              <span className="countdown-label">Kết thúc sau</span>

              <div className="countdown-box">
                <strong>{String(timeLeft.hours).padStart(2, "0")}</strong>
                <small>GIỜ</small>
              </div>

              <div className="countdown-box">
                <strong>{String(timeLeft.minutes).padStart(2, "0")}</strong>
                <small>PHÚT</small>
              </div>

              <div className="countdown-box">
                <strong>{String(timeLeft.seconds).padStart(2, "0")}</strong>
                <small>GIÂY</small>
              </div>
            </div>

            <Link to="/products" className="flash-view-all">
              Xem tất cả
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <div className="flash-products-grid">
          {products.map((product, index) => {
            const oldPrice = Number(product.price) * 1.18;

            const discount =
              index === 0 ? 14 : index === 1 ? 11 : index === 2 ? 12 : 18;

            const badges = ["GIẢM GIÁ", "BÁN CHẠY", "NỔI BẬT", "GIẢM GIÁ"];

            return (
              <div className="flash-product-card" key={product._id}>
                {/* NHÃN SẢN PHẨM */}
                <span
                  className={`flash-product-badge badge-${
                    ["sale", "best-seller", "hot", "sale"][index]
                  }`}
                >
                  {badges[index]}
                </span>

                {/* PHẦN TRĂM GIẢM GIÁ */}
                <span className="flash-discount-badge">-{discount}%</span>

                {/* HÌNH ẢNH */}
                <Link
                  to={`/products/${product._id}`}
                  className="flash-product-image"
                >
                  <img
                    src={
                      product.image
                        ? `/products/${product.image}`
                        : product.images?.[0] ||
                          "/images/product-placeholder.jpg"
                    }
                    alt={product.name}
                  />
                </Link>

                {/* DANH SÁCH YÊU THÍCH */}
                <button
                  className="flash-wishlist"
                  aria-label="Thêm vào danh sách yêu thích"
                  type="button"
                >
                  <Heart size={16} />
                </button>

                {/* THÔNG TIN SẢN PHẨM */}
                <div className="flash-product-info">
                  <span className="flash-product-brand">
                    {product.brand?.name || "Công nghệ"}
                  </span>

                  <Link
                    to={`/products/${product._id}`}
                    className="flash-product-title"
                  >
                    {product.name}
                  </Link>

                  <div className="flash-product-rating">
                    <span>★</span>
                    <strong>4.8</strong>
                    <small>(342)</small>
                  </div>

                  <div className="flash-stock">
                    <span></span>
                    Còn hàng
                  </div>

                  <div className="flash-product-bottom">
                    <div className="flash-prices">
                      <strong>
                        {Number(product.price).toLocaleString("vi-VN")} ₫
                      </strong>

                      <span>
                        {Math.round(oldPrice).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>

                    <button
                      className="flash-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      aria-label="Thêm vào giỏ hàng"
                      type="button"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FlashSale;
