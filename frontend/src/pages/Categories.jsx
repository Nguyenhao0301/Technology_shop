import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoryApi";
import "./Categories.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getCategories();

        console.log("CATEGORIES RESULT:", result);

        setCategories(result.data);
      } catch (error) {
        console.error("Get categories error:", error);

        setError(error.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <main className="categories-page">
        <div className="categories-message">
          <div className="loading-spinner"></div>

          <h1>Loading Categories...</h1>

          <p>Please wait while we load categories.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="categories-page">
        <div className="categories-message">
          <h1>Something went wrong</h1>

          <p>{error}</p>

          <Link to="/">← Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="categories-page">
      <div className="categories-container">
        {/* HEADER */}

        <div className="categories-header">
          <div className="categories-title">
            <span className="categories-label">Khám phá</span>

            <h1>Danh mục</h1>
          </div>

          <p>Trải nghiệm công nghệ. Làm chủ cuộc chơi.</p>
        </div>

        {/* CATEGORY GRID */}

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category._id}`}
              className="category-card"
              key={category._id}
            >
              {/* IMAGE */}

              <div className="category-image">
                <img
                  src={`/categories/${category.image}`}
                  alt={category.name}
                />
              </div>

              {/* CONTENT */}

              <div className="category-content">
                <h2>{category.name}</h2>

                <span className="category-link">
                  Khám phá sản phẩm
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

export default Categories;
