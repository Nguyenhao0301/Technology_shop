import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../api/productApi";
import "./NewArrivals.css";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts();

        console.log("NEW ARRIVALS RESULT:", result);

        // Tạm lấy 4 sản phẩm tiếp theo Featured Products
        setProducts(result.data.slice(4, 8));
      } catch (error) {
        console.error("Get new arrivals error:", error);

        setError(error.message || "Không thể tải sản phẩm mới.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // TRẠNG THÁI ĐANG TẢI
  if (loading) {
    return (
      <section className="new-arrivals">
        <div className="new-arrivals-container">
          <div className="new-arrivals-message">
            <div className="loading-spinner"></div>

            <h2>Đang tải sản phẩm...</h2>

            <p>Vui lòng chờ trong khi chúng tôi tải các sản phẩm mới.</p>
          </div>
        </div>
      </section>
    );
  }

  // TRẠNG THÁI LỖI
  if (error) {
    return (
      <section className="new-arrivals">
        <div className="new-arrivals-container">
          <div className="new-arrivals-message">
            <h2>Không thể tải sản phẩm</h2>

            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // TRẠNG THÁI KHÔNG CÓ SẢN PHẨM
  if (products.length === 0) {
    return (
      <section className="new-arrivals">
        <div className="new-arrivals-container">
          <div className="new-arrivals-message">
            <h2>Chưa có sản phẩm mới</h2>

            <p>Hiện chưa có sản phẩm mới nào để hiển thị.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-container">
        {/* TIÊU ĐỀ */}
        <div className="new-arrivals-header">
          <div className="new-arrivals-heading">
            <span className="section-label">SẢN PHẨM MỚI</span>

            <h2>
              Vừa cập <span>bến</span>
            </h2>

            <p>
              Khám phá những sản phẩm mới nhất từ các thương hiệu công nghệ yêu
              thích của bạn.
            </p>
          </div>

          <Link to="/products" className="new-arrivals-view-all">
            Xem tất cả
            <span>→</span>
          </Link>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <div className="new-arrivals-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
