import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBrands } from "../api/brandApi";
import "./FeaturedBrands.css";

function FeaturedBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getBrands();

        // Hỗ trợ dữ liệu API trả về dưới dạng mảng hoặc object chứa data.
        const brandData = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setBrands(brandData.slice(0, 6));
      } catch (err) {
        console.error("Lỗi tải danh sách thương hiệu:", err);
        setError(err.message || "Không thể tải danh sách thương hiệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section
        className="featured-brands"
        aria-label="Thương hiệu nổi bật"
        aria-busy="true"
      >
        <div className="featured-brands-message" role="status">
          Đang tải danh sách thương hiệu...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-brands" aria-label="Thương hiệu nổi bật">
        <div className="featured-brands-message" role="alert">
          Không thể tải danh sách thương hiệu. Vui lòng thử lại sau.
        </div>
      </section>
    );
  }

  return (
    <section className="featured-brands" aria-label="Thương hiệu nổi bật">
      <div className="featured-brands-header">
        <div>
          <span className="featured-brands-label">Thương hiệu nổi bật</span>

          <h2>
            Thương hiệu <span>nổi bật</span>
          </h2>

          <p>
            Khám phá các sản phẩm đến từ những thương hiệu công nghệ và gaming
            hàng đầu.
          </p>
        </div>

        <Link to="/brands" className="featured-brands-view-all">
          Xem tất cả thương hiệu →
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="featured-brands-message">
          Hiện chưa có thương hiệu nào để hiển thị.
        </div>
      ) : (
        <div className="featured-brands-grid">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              to={`/products?brand=${brand._id}`}
              className="featured-brand-card"
            >
              <div className="featured-brand-logo">
                <img
                  src={`/brands/${brand.logo}`}
                  alt={`Logo ${brand.name}`}
                  loading="lazy"
                />
              </div>

              <div className="featured-brand-content">
                <h3>{brand.name}</h3>
                <span>Khám phá sản phẩm →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedBrands;
