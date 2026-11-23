import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function CategoryCard({ category }) {
  return (
    <Link to={`/products?category=${category._id}`} className="category-card">
      <div className="category-card-image">
        <img src={`/images/categories/${category.image}`} alt={category.name} />
      </div>

      <div className="category-card-overlay"></div>

      <div className="category-card-content">
        <span className="category-card-subtitle">Khám phá bộ sưu tầm của chúng tôi</span>

        <h3>{category.name}</h3>

        <span className="category-card-count">Xem sản phẩm</span>

        <span className="category-card-arrow">
          <ArrowUpRight size={15} strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;
