import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import { getCategories } from "../api/categoryApi";
import "./CategoriesShowcase.css";

function CategoriesShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(false);

        const result = await getCategories();

        const categoryData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        setCategories(categoryData);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section
      className="categories-showcase"
      aria-label="Danh mục sản phẩm"
      aria-busy={loading}
    >
      <div className="categories-header">
        <div className="categories-badge">
          <span aria-hidden="true"></span>
          Danh mục sản phẩm
        </div>

        <div className="categories-title">
          <h2>
            Mua sắm theo <span>danh mục</span>
          </h2>
        </div>

        <div className="categories-description">
          <p>
            Khám phá laptop, PC, phụ kiện gaming và các thiết bị công nghệ phù
            hợp với nhu cầu của bạn.
          </p>
        </div>
      </div>

      <div className="categories-divider"></div>

      {loading ? (
        <div className="categories-message" role="status">
          Đang tải danh mục sản phẩm...
        </div>
      ) : error ? (
        <div className="categories-message" role="alert">
          Không thể tải danh mục. Vui lòng thử lại sau.
        </div>
      ) : categories.length === 0 ? (
        <div className="categories-message">
          Hiện chưa có danh mục sản phẩm để hiển thị.
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoriesShowcase;
