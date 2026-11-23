import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBrands } from "../api/brandApi";
import "./Brands.css";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getBrands();

        console.log("BRANDS RESULT:", result);

        setBrands(result.data);
      } catch (error) {
        console.error("Get brands error:", error);

        setError(error.message || "Failed to load brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <main className="brands-page">
        <div className="brands-message">
          <div className="loading-spinner"></div>

          <h1>Loading Brands...</h1>

          <p>Please wait while we load brands.</p>
        </div>
      </main>
    );
  }

  // ERROR
  if (error) {
    return (
      <main className="brands-page">
        <div className="brands-message">
          <h1>Something went wrong</h1>

          <p>{error}</p>

          <Link to="/">← Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="brands-page">
      <div className="brands-container">

        <div className="brands-header">
          <div className="brands-title">
            <span className="brands-label">Tìm hiểu</span>

            <h1>Thương hiệu</h1>
          </div>

          <p>Trải nghiệm các dòng sản phẩm công nghệ và giải trí đỉnh cao từ những thương hiệu uy tín</p>
        </div>

        <div className="brands-grid">
          {brands.map((brand) => (
            <Link
              to={`/products?brand=${brand._id}`}
              className="brand-card"
              key={brand._id}
            >

              <div className="brand-logo">
                <img src={`/brands/${brand.logo}`} alt={brand.name} />
              </div>

              <div className="brand-content">
                <h2>{brand.name}</h2>

                <span className="brand-link">
                  Khám phá thêm
                  <span className="arrow">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Brands;
