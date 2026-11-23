import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedProducts } from "../api/productApi";
import "./RelatedProducts.css";

function RelatedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;

    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getRelatedProducts(productId);

        if (isMounted) {
          setProducts(result.data || []);
        }
      } catch (err) {
        console.error("Failed to load related products:", err);

        if (isMounted) {
          setError("Không thể tải sản phẩm liên quan.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRelatedProducts();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <section className="related-products-section">
        <h2 className="related-products-title">Sản phẩm liên quan</h2>
        <p className="related-products-message">Đang tải sản phẩm...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="related-products-section">
        <h2 className="related-products-title">Sản phẩm liên quan</h2>
        <p className="related-products-message">{error}</p>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="related-products-section">
      <div className="related-products-header">
        <div>
          <span className="related-products-eyebrow">YOU MAY ALSO LIKE</span>
          <h2 className="related-products-title">Sản phẩm liên quan</h2>
          <p className="related-products-subtitle">
            Khám phá thêm những sản phẩm phù hợp với bạn.
          </p>
        </div>

        <Link to="/products" className="related-products-view-all">
          Xem tất cả <span>→</span>
        </Link>
      </div>

      <div className="related-products-grid">
        {products.map((item) => {
          const hasDiscount =
            Number(item.discountPrice) > 0 &&
            Number(item.discountPrice) < Number(item.price);

          return (
            <article className="related-product-card" key={item._id}>
              <Link
                to={`/products/${item._id}`}
                className="related-product-image"
              >
                {item.image ? (
                  <img
                    src={`http://localhost:3000/uploads/products/${item.image}`}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/product-placeholder.jpg";
                    }}
                  />
                ) : (
                  <div className="related-product-no-image">No image</div>
                )}

                {hasDiscount && (
                  <span className="related-product-discount">SALE</span>
                )}
              </Link>

              <div className="related-product-info">
                <span className="related-product-brand">
                  {item.brand?.name || "Technology"}
                </span>

                <Link
                  to={`/products/${item._id}`}
                  className="related-product-name"
                >
                  {item.name}
                </Link>

                <div className="related-product-prices">
                  {hasDiscount ? (
                    <>
                      <strong className="related-product-sale-price">
                        {Number(item.discountPrice).toLocaleString("vi-VN")}₫
                      </strong>
                      <span className="related-product-old-price">
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </span>
                    </>
                  ) : (
                    <strong className="related-product-price">
                      {Number(item.price).toLocaleString("vi-VN")}₫
                    </strong>
                  )}
                </div>

                <div
                  className={`related-product-stock ${
                    item.stock > 0 ? "available" : "unavailable"
                  }`}
                >
                  {item.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedProducts;
