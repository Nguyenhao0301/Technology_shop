import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FeaturedCarousel.css";

const slides = [
  {
    id: 1,
    title: "Level Up Your Gaming",
    description: "Discover powerful gaming gear built for your ultimate setup.",
    image: "/banners/gaming-banner.jpg",
    button: "Shop Gaming",
  },

  {
    id: 2,
    title: "Power Meets Performance",
    description: "Explore high-performance laptops and PCs for work and play.",
    image: "/banners/laptop-banner.jpg",
    button: "Explore Laptops",
  },

  {
    id: 3,
    title: "Build Your Dream Setup",
    description:
      "Complete your setup with premium keyboards, mice and headsets.",
    image: "/banners/setup-banner.jpg",
    button: "Build Your Setup",
  },

  {
    id: 4,
    title: "Premium Technology",
    description: "Upgrade your digital world with the latest technology.",
    image: "/banners/technology-banner.jpg",
    button: "Shop Now",
  },
];

function FeaturedCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tự động chuyển slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Slide trước
  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Slide tiếp theo
  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="featured-carousel">
      <div className="featured-carousel-container">
        <div className="featured-carousel-slide">
          {/* IMAGE */}

          <div className="featured-carousel-image">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
            />
          </div>

          {/* OVERLAY */}

          <div className="featured-carousel-overlay"></div>

          {/* CONTENT */}

          <div className="featured-carousel-content">
            <span>Đặc trưng</span>

            <h2>{slides[currentSlide].title}</h2>

            <p>{slides[currentSlide].description}</p>

            <Link to="/products">
              {slides[currentSlide].button}
              <span> →</span>
            </Link>
          </div>

          {/* PREVIOUS */}

          <button
            className="carousel-arrow carousel-prev"
            onClick={handlePrevious}
            aria-label="Previous slide"
          >
            ←
          </button>

          {/* NEXT */}

          <button
            className="carousel-arrow carousel-next"
            onClick={handleNext}
            aria-label="Next slide"
          >
            →
          </button>

          {/* INDICATORS */}

          <div className="carousel-indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={index === currentSlide ? "active" : ""}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCarousel;
