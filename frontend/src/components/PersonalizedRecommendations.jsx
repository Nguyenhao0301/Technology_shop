import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productApi";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import "./PersonalizedRecommendations.css";

function PersonalizedRecommendations() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const history = getRecentlyViewed();

        if (history.length === 0) {
          if (isMounted) setProducts([]);
          return;
        }

        const result = await getProducts({ limit: 100 });
        const allProducts = Array.isArray(result.data) ? result.data : [];

        const viewedIds = new Set(history.map((item) => item._id));
        const categoryIds = new Set(
          history
            .map((item) =>
              typeof item.category === "object"
                ? item.category?._id || item.category?.name
                : item.category,
            )
            .filter(Boolean),
        );

        const brandNames = new Set(
          history.map((item) => item.brand?.name || item.brand).filter(Boolean),
        );

        const recommendations = allProducts
          .filter((item) => !viewedIds.has(item._id))
          .map((item) => {
            const categoryId =
              typeof item.category === "object"
                ? item.category?._id || item.category?.name
                : item.category;

            const brandName =
              typeof item.brand === "object" ? item.brand?.name : item.brand;

            let score = 0;

            if (categoryId && categoryIds.has(categoryId)) {
              score += 3;
            }

            if (brandName && brandNames.has(brandName)) {
              score += 2;
            }

            return { ...item, recommendationScore: score };
          })
          .filter((item) => item.recommendationScore > 0)
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 8);

        if (isMounted) setProducts(recommendations);
      } catch (err) {
        console.error("Failed to load recommendations:", err);

        if (isMounted) {
          setError("Không thể tải gợi ý sản phẩm.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && !error && products.length === 0) return null;

  return (
    <section className="personalized-section">
      <div className="personalized-header">
        <div>
          <span className="personalized-eyebrow">PICKED FOR YOU</span>
          <h2 className="personalized-title">Gợi ý dành cho bạn</h2>
          <p className="personalized-subtitle">
            Những sản phẩm được chọn dựa trên sở thích của bạn.
          </p>
        </div>

        <Link to="/products" className="personalized-view-all">
          Khám phá thêm →
        </Link>
      </div>

      {loading ? (
        <p className="personalized-message">Đang tải gợi ý...</p>
      ) : error ? (
        <p className="personalized-message">{error}</p>
      ) : (
        <div className="personalized-grid">
          {products.map((item) => {
            const hasDiscount =
              Number(item.discountPrice) > 0 &&
              Number(item.discountPrice) < Number(item.price);

            return (
              <article className="personalized-card" key={item._id}>
                <Link
                  to={`/products/${item._id}`}
                  className="personalized-image"
                >
                  {item.image ? (
                    <img
                      src={`http://localhost:3000/uploads/products/${item.image}`}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          "/images/product-placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="personalized-no-image">No image</div>
                  )}
                </Link>

                <div className="personalized-info">
                  <span className="personalized-brand">
                    {item.brand?.name || "Technology"}
                  </span>

                  <Link
                    to={`/products/${item._id}`}
                    className="personalized-name"
                  >
                    {item.name}
                  </Link>

                  <div className="personalized-prices">
                    {hasDiscount ? (
                      <>
                        <strong className="personalized-sale-price">
                          {Number(item.discountPrice).toLocaleString("vi-VN")}₫
                        </strong>
                        <span className="personalized-old-price">
                          {Number(item.price).toLocaleString("vi-VN")}₫
                        </span>
                      </>
                    ) : (
                      <strong className="personalized-price">
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </strong>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PersonalizedRecommendations;
