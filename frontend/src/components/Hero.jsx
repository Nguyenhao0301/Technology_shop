import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-glow hero-glow-left"></div>
      <div className="hero-glow hero-glow-right"></div>

      <div className="hero-container">
        {/* NỘI DUNG BÊN TRÁI */}
        <div className="hero-content">
          <div className="hero-badge">
            <span></span>
            CÔNG NGHỆ THẾ HỆ MỚI
          </div>

          <h1>
            BỨT PHÁ
            <br />
            <span>GIỚI HẠN.</span>
          </h1>

          <p className="hero-description">
            Thiết bị gaming cao cấp và phụ kiện công nghệ được tuyển chọn để
            mang lại hiệu năng vượt trội. Tối ưu cho gaming — sẵn sàng cho mọi
            trải nghiệm.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="hero-btn hero-btn-primary">
              Mua sắm ngay
              <span>→</span>
            </Link>

            <Link to="/categories" className="hero-btn hero-btn-secondary">
              Khám phá danh mục
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>100+</strong>
              <span>Sản phẩm</span>
            </div>

            <div className="hero-stat">
              <strong>20+</strong>
              <span>Thương hiệu</span>
            </div>

            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Hỗ trợ</span>
            </div>
          </div>
        </div>

        {/* HÌNH ẢNH BÊN PHẢI */}
        <div className="hero-visual">
          <div className="hero-circle"></div>

          <div className="hero-image-wrapper">
            <img
              src={heroImg}
              alt="Thiết bị công nghệ và gaming"
              className="hero-image"
            />
          </div>

          {/* ƯU ĐÃI ĐẶC BIỆT */}
          <div className="hero-floating-card hero-sale">
            <div className="floating-icon">ϟ</div>

            <div>
              <strong>Flash Sale</strong>
              <span>Giảm đến 40%</span>
            </div>
          </div>

          {/* SẢN PHẨM MỚI */}
          <div className="hero-floating-card hero-new">
            <div className="floating-icon">▣</div>

            <div>
              <strong>Sản phẩm mới</strong>
              <span>Công nghệ mới nhất</span>
            </div>
          </div>

          {/* ĐÁNH GIÁ CAO */}
          <div className="hero-floating-card hero-rating">
            <div className="floating-icon">★</div>

            <div>
              <strong>Được đánh giá cao</strong>
              <span>4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
