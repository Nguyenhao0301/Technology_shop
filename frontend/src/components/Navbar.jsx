import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import { getCategories } from "../api/categoryApi";
import { getBrands } from "../api/brandApi";
import MiniCart from "./MiniCart";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem("user");

      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    const fetchNavbarData = async () => {
      try {
        const [categoriesResult, brandsResult] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(categoriesResult.data || []);
        setBrands(brandsResult.data || []);
      } catch (error) {
        console.error("Get navbar categories/brands error:", error);
      }
    };

    fetchNavbarData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(new Event("authChanged"));
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">T</span>
          <span className="logo-text">
            Technology<span>&</span>Gaming
          </span>
        </Link>

        <nav className="navbar-menu">
          <Link to="/" className="nav-link">
            Trang chủ
          </Link>

          <div className="nav-item mega-menu-wrapper">
            <Link to="/products" className="nav-link products-link">
              Sản phẩm<span className="nav-arrow"></span>
            </Link>

            <div className="mega-menu">
              <div className="mega-column">
                <h4>MÁY TÍNH & THIẾT BỊ</h4>

                {categories
                  .filter((category) =>
                    ["laptop", "gaming pc", "monitor"].includes(
                      category.name.toLowerCase(),
                    ),
                  )
                  .map((category) => {
                    const icons = {
                      Laptop: "💻",
                      "Gaming PC": "🖥️",
                      Monitor: "🖥️",
                    };

                    return (
                      <Link
                        key={category._id}
                        to={`/products?category=${category._id}`}
                      >
                        <span>{icons[category.name] || "▣"}</span>
                        {category.name}
                      </Link>
                    );
                  })}
              </div>

              <div className="mega-column">
                <h4>THIẾT BỊ GAMING</h4>

                {categories
                  .filter((category) =>
                    ["keyboard", "mouse", "headset"].includes(
                      category.name.toLowerCase(),
                    ),
                  )
                  .map((category) => {
                    const icons = {
                      Keyboard: "⌨️",
                      Mouse: "🖱️",
                      Headset: "🎧",
                    };

                    return (
                      <Link
                        key={category._id}
                        to={`/products?category=${category._id}`}
                      >
                        <span>{icons[category.name] || "▣"}</span>
                        {category.name}
                      </Link>
                    );
                  })}
              </div>

              <div className="mega-column">
                <h4>THIẾT BỊ & PHỤ KIỆN</h4>

                {categories
                  .filter((category) =>
                    ["keyboard", "mouse", "headset"].includes(
                      category.name.toLowerCase(),
                    ),
                  )
                  .map((category) => {
                    const icons = {
                      Keyboard: "⌨️",
                      Mouse: "🖱️",
                      Headset: "🎧",
                    };

                    return (
                      <Link
                        key={category._id}
                        to={`/products?category=${category._id}`}
                      >
                        <span>{icons[category.name] || "▣"}</span>
                        {category.name}
                      </Link>
                    );
                  })}
              </div>

              <div className="mega-featured">
                <span className="featured-label">CÔNG NGHỆ</span>

                <h3>
                  Nâng cấp
                  <br />
                  góc công nghệ
                </h3>

                <p>Khám phá các thiết bị công nghệ và gaming mới nhất.</p>

                <Link to="/products" className="featured-button">
                  Mua sắm ngay →
                </Link>
              </div>
            </div>
          </div>

          <div className="nav-item mega-menu-wrapper">
            <Link to="/categories" className="nav-link products-link">
              Danh mục
              <span className="nav-arrow"></span>
            </Link>

            <div className="mega-menu category-menu">
              <div className="mega-column">
                <h4>DANH MỤC SẢN PHẨM</h4>

                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                  >
                    <span>▣</span>
                    {category.name}
                  </Link>
                ))}
              </div>

              <div className="mega-featured">
                <span className="featured-label">DANH MỤC</span>

                <h3>
                  Tìm thiết bị
                  <br />
                  phù hợp
                </h3>

                <p>
                  Khám phá sản phẩm theo danh mục để tìm thiết bị phù hợp với
                  nhu cầu của bạn.
                </p>

                <Link to="/categories" className="featured-button">
                  Xem danh mục →
                </Link>
              </div>
            </div>
          </div>

          <div className="nav-item mega-menu-wrapper">
            <Link to="/brands" className="nav-link products-link">
              Thương hiệu
              <span className="nav-arrow"></span>
            </Link>
            <div className="mega-menu brand-menu">
              <div className="mega-column">
                <h4>THƯƠNG HIỆU NỔI BẬT</h4>

                {brands.map((brand) => (
                  <Link key={brand._id} to={`/products?brand=${brand._id}`}>
                    <span>◆</span>
                    {brand.name}
                  </Link>
                ))}
              </div>

              <div className="mega-featured">
                <span className="featured-label">THƯƠNG HIỆU</span>

                <h3>
                  Công nghệ
                  <br />
                  đáng tin cậy
                </h3>

                <p>Khám phá sản phẩm từ các thương hiệu công nghệ uy tín.</p>

                <Link to="/brands" className="featured-button">
                  Xem thương hiệu →
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Link to="/vouchers" className="nav-link">
          Voucher
        </Link>

        <div className="navbar-actions">
          <button
            className="nav-action theme-toggle"
            onClick={toggleTheme}
            title="Đổi giao diện sáng/tối"
            aria-label="Đổi giao diện sáng/tối"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              padding: "0 8px",
              color: "var(--text-primary)",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <Link
            to="/products"
            className="nav-action search-action"
            aria-label="Tìm kiếm sản phẩm"
          >
            <svg viewBox="0 0 24 24" className="nav-icon">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>

          <MiniCart />
          <NotificationBell user={user} />

          {user ? (
            <>
              {user.role === "staff" || user.role === "admin" ? (
                <Link to="/admin/orders" className="orders-button">
                  Quản lý đơn hàng
                </Link>
              ) : (
                <Link to="/orders" className="orders-button">
                  Đơn hàng của tôi
                </Link>
              )}

              <Link to="/profile" className="user-name">
                Xin chào, {user.name}
              </Link>

              <button className="logout-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Đăng nhập
            </Link>
          )}

          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu mobile-menu-open">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>

          <Link to="/products" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </Link>

          <Link to="/categories" onClick={() => setMenuOpen(false)}>
            Danh mục
          </Link>

          <Link to="/brands" onClick={() => setMenuOpen(false)}>
            Thương hiệu
          </Link>

          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng
          </Link>

          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Tài khoản của tôi
              </Link>

              {user.role === "staff" || user.role === "admin" ? (
                <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>
                  Quản lý đơn hàng
                </Link>
              ) : (
                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  Đơn hàng của tôi
                </Link>
              )}

              <button
                className="logout-button"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
