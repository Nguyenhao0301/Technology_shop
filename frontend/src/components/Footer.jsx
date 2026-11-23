import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-column footer-brand">
          <h3>
            Công nghệ <span>&</span> Gaming
          </h3>

          <p>Cửa hàng Công nghệ & Gaming - Sản phẩm Gaming và Công nghệ.</p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-column">
          <h4>truy cập nhanh</h4>

          <a href="/products">Sản phẩm</a>

          <a href="/categories">Danh mục</a>

          <a href="/brands">Thương hiệu</a>
        </div>

        {/* CONTACT */}
        <div className="footer-column">
          <h4>Liên lạc</h4>

          <p>Email: phuchao03011030@gmail.com</p>

          <p>Số điện thoại: 0939327463</p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>© 2026 Cửa hàng Công nghệ & Gaming</p>
      </div>
    </footer>
  );
}

export default Footer;
