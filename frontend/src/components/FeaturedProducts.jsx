import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../api/productApi";
import "./FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts();

        console.log("FEATURED PRODUCTS RESULT:", result);

        setProducts(result.data.slice(0, 4));
      } catch (error) {
        console.error("Get featured products error:", error);

        setError(error.message || "Không thể tải sản phẩm nổi bật.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // ĐANG TẢI
  if (loading) {
    return (
      <section className="featured-products">
        <div className="featured-message">
          <div className="loading-spinner"></div>

          <h2>Đang tải sản phẩm...</h2>

          <p>Vui lòng chờ trong khi chúng tôi tải các sản phẩm nổi bật.</p>
        </div>
      </section>
    );
  }

  // LỖI
  if (error) {
    return (
      <section className="featured-products">
        <div className="featured-message">
          <h2>Không thể tải sản phẩm</h2>

          <p>{error}</p>
        </div>
      </section>
    );
  }

  // KHÔNG CÓ SẢN PHẨM
  if (products.length === 0) {
    return (
      <section className="featured-products">
        <div className="featured-message">
          <h2>Chưa có sản phẩm nổi bật</h2>

          <p>Hiện tại chưa có sản phẩm nào để hiển thị.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products">
      <div className="featured-container">
        <div className="section-header">
          <div className="section-heading-content">
            <span className="section-label">SẢN PHẨM NỔI BẬT</span>

            <h2>
              Những lựa chọn <span>được yêu thích</span>
            </h2>

            <p>
              Khám phá những thiết bị được đội ngũ đam mê gaming và chuyên gia
              công nghệ tuyển chọn.
            </p>
          </div>

          <Link to="/products" className="view-all">
            Xem tất cả →
          </Link>
        </div>

        <div className="featured-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
