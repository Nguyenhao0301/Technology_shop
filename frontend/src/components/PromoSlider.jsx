import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PromoSlider.css";

const slides = [
  {
    image: "/banners/slide-1.jpg",
    label: "SẢN PHẨM MỚI",
    title: "Nâng Tầm Góc Gaming",
    description:
      "Khám phá những thiết bị công nghệ mạnh mẽ, nâng cao trải nghiệm chơi game của bạn.",
  },
  {
    image: "/banners/slide-2.jpg",
    label: "CÔNG NGHỆ",
    title: "Sức Mạnh Vượt Trội",
    description:
      "Khám phá những mẫu laptop, màn hình và thiết bị gaming mới nhất.",
  },
  {
    image: "/banners/slide-3.jpg",
    label: "DÀNH CHO GAME THỦ",
    title: "Chinh Phục Mọi Trận Đấu",
    description:
      "Nâng cấp góc gaming của bạn với những thiết bị chất lượng cao.",
  },
  {
    image: "/banners/slide-4.jpg",
    label: "ƯU ĐÃI ĐẶC BIỆT",
    title: "Công Nghệ Trong Tầm Tay",
    description:
      "Sở hữu những thiết bị công nghệ chất lượng với mức giá hấp dẫn.",
  },
];

function PromoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="promo-slider"
      aria-label="Banner quảng bá sản phẩm và khuyến mãi"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`promo-slide ${index === currentSlide ? "is-active" : ""}`}
          aria-hidden={index !== currentSlide}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="promo-slider-image"
          />

          <div className="promo-slider-overlay" />

          <div className="promo-slider-content">
            <span>{slide.label}</span>

            <h2>{slide.title}</h2>

            <p>{slide.description}</p>

            <Link
              to="/products"
              className="promo-slider-cta"
              tabIndex={index === currentSlide ? 0 : -1}
            >
              Khám phá ngay
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="slider-button slider-prev"
        onClick={previousSlide}
        aria-label="Chuyển đến banner trước"
      >
        ←
      </button>

      <button
        type="button"
        className="slider-button slider-next"
        onClick={nextSlide}
        aria-label="Chuyển đến banner tiếp theo"
      >
        →
      </button>

      <div className="slider-dots" aria-label="Chọn banner">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.image}
            className={index === currentSlide ? "active" : ""}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Chuyển đến banner ${index + 1}`}
            aria-current={index === currentSlide ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default PromoSlider;
