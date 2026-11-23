import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FlashDeals.css";

const API_URL = "http://localhost:3000/api/products/flash-deals";
const API_BASE_URL = "http://localhost:3000";

function formatVND(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    return "Chưa có giá";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscountPercent(price, discountPrice) {
  const originalPrice = Number(price);
  const salePrice = Number(discountPrice);

  if (
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(salePrice) ||
    originalPrice <= 0 ||
    salePrice < 0 ||
    salePrice >= originalPrice
  ) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function getProductImage(image) {
  if (!image || typeof image !== "string") {
    return "/images/product-placeholder.jpg";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/uploads/products/${image}`;
}

function FlashDeals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách ưu đãi.");
        }

        const result = await response.json();

        const productData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.products)
            ? result.data.products
            : [];

        setProducts(productData);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Lỗi tải Flash Deals:", err);
        setError("Chưa thể tải danh sách ưu đãi. Vui lòng thử lại sau.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFlashDeals();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="flash-deals" aria-busy="true">
        <p className="flash-deals-message" role="status">
          Đang tải ưu đãi...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flash-deals">
        <p className="flash-deals-message" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flash-deals" aria-label="Ưu đãi sản phẩm">
      <div className="flash-deals-heading">
        <div>
          <span className="flash-deals-eyebrow">ƯU ĐÃI CÓ THỜI HẠN</span>

          <h2>
            Chương trình <span>giảm giá</span>
          </h2>

          <p>Săn deal công nghệ, tiết kiệm nhiều hơn.</p>
        </div>

        <div className="flash-deals-tag">⚡ Ưu đãi đặc biệt</div>
      </div>

      <div className="flash-deals-grid">
        {products.map((product) => {
          const discountPercent = getDiscountPercent(
            product.price,
            product.discountPrice,
          );

          const stock = Number(product.stock);
          const hasStock = Number.isFinite(stock) && stock > 0;
          const productLink = `/products/${product._id}`;

          return (
            <article className="flash-deal-card" key={product._id}>
              <Link
                to={productLink}
                className="flash-deal-image"
                aria-label={`Xem ${product.name || "sản phẩm"}`}
              >
                <img
                  src={getProductImage(product.image)}
                  alt={product.name || "Sản phẩm công nghệ"}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/product-placeholder.jpg";
                  }}
                />

                {discountPercent > 0 && (
                  <span className="flash-deal-discount">
                    -{discountPercent}%
                  </span>
                )}
              </Link>

              <div className="flash-deal-content">
                <span className="flash-deal-brand">
                  {product.brand?.name || "Technology & Gaming"}
                </span>

                <Link
                  to={productLink}
                  className="flash-deal-name"
                  title={product.name || ""}
                >
                  {product.name || "Sản phẩm chưa có tên"}
                </Link>

                <div className="flash-deal-prices">
                  <span className="flash-deal-sale-price">
                    {formatVND(product.discountPrice)}
                  </span>

                  {discountPercent > 0 && (
                    <span className="flash-deal-original-price">
                      {formatVND(product.price)}
                    </span>
                  )}
                </div>

                <div className="flash-deal-stock">
                  <span className={hasStock ? "in-stock" : "out-of-stock"}>
                    {hasStock ? `Còn hàng: ${stock}` : "Tạm hết hàng"}
                  </span>

                  <span className="flash-deal-promo-label">
                    ⚡ Chương trình giảm giá
                  </span>
                </div>

                <Link to={productLink} className="flash-deal-button">
                  Xem sản phẩm
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FlashDeals;
