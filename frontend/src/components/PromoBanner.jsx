import { useEffect, useState } from "react";
import "./PromoBanner.css";

const promotions = [
  {
    id: 1,
    title: "Nâng Cấp Góc Công Nghệ",
    description: "Khám phá những thiết bị công nghệ hiện đại phục vụ công việc, giải trí và mọi nhu cầu của bạn.",
    button: "Mua sắm ngay",
    image: "/promotions/promo-1.jpg",
  },
  {
    id: 2,
    title: "Bứt Phá Trải Nghiệm Gaming",
    description: "Trang bị những phụ kiện cần thiết để xây dựng góc gaming lý tưởng của riêng bạn.",
    button: "Khám phá gaming",
    image: "/promotions/promo-2.jpg",
  },
  {
    id: 3,
    title: "Khơi Nguồn Sức Mạnh Công Nghệ",
    description: "Khám phá các thiết bị công nghệ hiện đại, giúp cuộc sống mỗi ngày tiện lợi hơn.",
    button: "Khám phá ngay",
    image: "/promotions/promo-3.jpg",
  },
];

function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tự động chuyển banner sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const promotion = promotions[currentSlide];

  return (
    <section className="promo-section" aria-label="Chương trình khuyến mãi">
      <div className="promo-slider">
        {/* Hình ảnh khuyến mãi */}
        <div className="promo-image">
          <img src={promotion.image} alt={promotion.title} />
        </div>

        {/* Nội dung khuyến mãi */}
        <div className="promo-content">
          <span className="promo-label">ƯU ĐÃI ĐẶC BIỆT</span>

          <h2>{promotion.title}</h2>

          <p>{promotion.description}</p>

          <button type="button" className="promo-button">
            {promotion.button}
            <span aria-hidden="true"> →</span>
          </button>
        </div>

        {/* Nút chuyển về banner trước */}
        <button
          type="button"
          className="promo-arrow promo-arrow-left"
          onClick={previousSlide}
          aria-label="Chuyển đến chương trình khuyến mãi trước"
        >
          ←
        </button>

        {/* Nút chuyển đến banner tiếp theo */}
        <button
          type="button"
          className="promo-arrow promo-arrow-right"
          onClick={nextSlide}
          aria-label="Chuyển đến chương trình khuyến mãi tiếp theo"
        >
          →
        </button>

        {/* Các nút chọn banner */}
        <div className="promo-dots" aria-label="Chọn chương trình khuyến mãi">
          {promotions.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={
                index === currentSlide ? "promo-dot active" : "promo-dot"
              }
              onClick={() => setCurrentSlide(index)}
              aria-label={`Chuyển đến chương trình khuyến mãi ${index + 1}`}
              aria-current={index === currentSlide ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PromoBanner;
