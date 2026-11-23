import { useEffect, useState } from "react";
import { Flame, Sparkles, Zap, Clock3 } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts, getTopSellingProducts } from "../api/productApi";
import "./ProductShowcase.css";

const TABS = [
  {
    id: "featured",
    label: "Nổi bật",
    icon: Sparkles,
    title: "Sản phẩm nổi bật",
    description: "Khám phá những sản phẩm công nghệ và gaming được yêu thích.",
  },
  {
    id: "new",
    label: "Sản phẩm mới",
    icon: Zap,
    title: "Sản phẩm vừa cập bến",
    description:
      "Cập nhật những sản phẩm mới nhất từ các thương hiệu yêu thích.",
  },
  {
    id: "flash",
    label: "Giờ vàng ưu đãi",
    icon: Flame,
    title: "Ưu đãi không thể bỏ lỡ",
    description:
      "Giá ưu đãi có thời hạn cho các thiết bị chất lượng. Đừng bỏ lỡ!",
  },
];

function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("featured");

  const [topPeriod, setTopPeriod] = useState("day");
  const [topProducts, setTopProducts] = useState([]);
  const [topLoading, setTopLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 23,
    seconds: 19,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải danh sách sản phẩm
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts();

        const productData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.products)
            ? result.data.products
            : [];

        if (isMounted) {
          setProducts(productData);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách sản phẩm:", err);

        if (isMounted) {
          setError(err.message || "Không thể tải danh sách sản phẩm.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Đồng hồ đếm ngược của tab Giờ vàng ưu đãi
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            ...prev,
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return {
          hours: 23,
          minutes: 59,
          seconds: 59,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tạm giữ cách chia nhóm hiện tại để không thay đổi nghiệp vụ
  const featuredProducts = products.slice(0, 4);
  const newProducts = products.slice(4, 8);
  const flashProducts = products.slice(0, 4);

  let activeProducts = featuredProducts;

  if (activeTab === "new") {
    activeProducts = newProducts;
  }

  if (activeTab === "flash") {
    activeProducts = flashProducts;
  }

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  // Tải danh sách sản phẩm bán chạy
  useEffect(() => {
    let isMounted = true;

    const fetchTopProducts = async () => {
      try {
        setTopLoading(true);

        const result = await getTopSellingProducts(topPeriod);

        const productData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.products)
            ? result.data.products
            : [];

        if (isMounted) {
          setTopProducts(productData);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm bán chạy:", err);

        if (isMounted) {
          setTopProducts([]);
        }
      } finally {
        if (isMounted) {
          setTopLoading(false);
        }
      }
    };

    fetchTopProducts();

    return () => {
      isMounted = false;
    };
  }, [topPeriod]);

  // Trạng thái đang tải sản phẩm
  if (loading) {
    return (
      <section
        className="product-showcase"
        aria-label="Bộ sưu tập sản phẩm"
        aria-busy="true"
      >
        <div className="product-showcase-container">
          <div className="product-showcase-header">
            <span className="showcase-label">DÀNH RIÊNG CHO BẠN</span>

            <h2>Bộ sưu tập sản phẩm</h2>
            <div className="showcase-line" />
          </div>

          <div className="showcase-loading">
            <div className="showcase-spinner" />
            <p>Đang tải sản phẩm...</p>
          </div>
        </div>
      </section>
    );
  }

  // Trạng thái lỗi khi tải sản phẩm
  if (error) {
    return (
      <section className="product-showcase">
        <div className="product-showcase-container">
          <div className="product-showcase-header">
            <span className="showcase-label">DÀNH RIÊNG CHO BẠN</span>

            <h2>Bộ sưu tập sản phẩm</h2>
            <div className="showcase-line" />
          </div>

          <div className="showcase-message" role="alert">
            <h3>Không thể tải sản phẩm</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-showcase" aria-label="Bộ sưu tập sản phẩm">
      <div className="product-showcase-container">
        <div className="product-showcase-header">
          <span className="showcase-label">DÀNH RIÊNG CHO BẠN</span>

          <h2>Bộ sưu tập sản phẩm</h2>
          <div className="showcase-line" />
        </div>

        {/* Các tab bộ sưu tập */}
        <div className="showcase-tabs-wrapper">
          <div className="showcase-tabs" role="tablist" aria-label="Bộ sưu tập">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`showcase-tab ${
                    isActive ? "showcase-tab-active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Khu vực sản phẩm bán chạy */}
        <div className="top-selling-section">
          <div className="top-selling-header">
            <h3>Sản phẩm bán chạy</h3>
            <p>Khám phá những sản phẩm được khách hàng lựa chọn nhiều nhất.</p>
          </div>

          <div
            className="top-selling-tabs"
            role="group"
            aria-label="Khoảng thời gian thống kê"
          >
            <button
              type="button"
              className={topPeriod === "day" ? "active" : ""}
              aria-pressed={topPeriod === "day"}
              onClick={() => setTopPeriod("day")}
            >
              Hôm nay
            </button>

            <button
              type="button"
              className={topPeriod === "week" ? "active" : ""}
              aria-pressed={topPeriod === "week"}
              onClick={() => setTopPeriod("week")}
            >
              Tuần này
            </button>

            <button
              type="button"
              className={topPeriod === "month" ? "active" : ""}
              aria-pressed={topPeriod === "month"}
              onClick={() => setTopPeriod("month")}
            >
              Tháng này
            </button>
          </div>

          {topLoading ? (
            <div className="showcase-loading" aria-busy="true">
              <div className="showcase-spinner" />
              <p>Đang tải sản phẩm bán chạy...</p>
            </div>
          ) : topProducts.length > 0 ? (
            <div className="showcase-products-grid">
              {topProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showSoldCount
                />
              ))}
            </div>
          ) : (
            <div className="showcase-empty">
              <h3>Chưa có dữ liệu</h3>
              <p>Chưa có sản phẩm bán chạy trong khoảng thời gian này.</p>
            </div>
          )}
        </div>

        {/* Tiêu đề bộ sưu tập đang chọn */}
        <div className="showcase-panel-header">
          <div className="showcase-panel-title">
            <h3>{currentTab.title}</h3>
            <p>{currentTab.description}</p>
          </div>

          {activeTab === "flash" && (
            <div
              className="showcase-countdown"
              aria-label="Thời gian đếm ngược của ưu đãi"
            >
              <div className="countdown-title">
                <Clock3 size={14} />
                <span>KẾT THÚC SAU</span>
              </div>

              <div className="countdown-values" aria-live="off">
                <div className="countdown-item">
                  <strong>{String(timeLeft.hours).padStart(2, "0")}</strong>
                  <span>GIỜ</span>
                </div>

                <span className="countdown-separator">:</span>

                <div className="countdown-item">
                  <strong>{String(timeLeft.minutes).padStart(2, "0")}</strong>
                  <span>PHÚT</span>
                </div>

                <span className="countdown-separator">:</span>

                <div className="countdown-item">
                  <strong>{String(timeLeft.seconds).padStart(2, "0")}</strong>
                  <span>GIÂY</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sản phẩm của tab đang chọn */}
        {activeProducts.length > 0 ? (
          <div
            key={activeTab}
            className="showcase-products-grid showcase-products-enter"
          >
            {activeProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="showcase-empty">
            <h3>Chưa có sản phẩm</h3>
            <p>Hiện chưa có sản phẩm nào trong bộ sưu tập này.</p>
          </div>
        )}

        <div className="showcase-footer">
          <a href="/products" className="showcase-view-all">
            Xem tất cả sản phẩm
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
