import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./SetupShowcase.css";

function SetupShowcase() {
  const [activeHotspot, setActiveHotspot] = useState(null);

  const hotspots = [
    {
      id: 1,
      top: "45%",
      left: "50%",
      title: "Màn hình Gaming cong",
      price: "$499",
      link: "/products",
    },
    {
      id: 2,
      top: "70%",
      left: "40%",
      title: "Bàn phím cơ Gaming",
      price: "$129",
      link: "/products",
    },
    {
      id: 3,
      top: "72%",
      left: "65%",
      title: "Chuột Gaming không dây",
      price: "$89",
      link: "/products",
    },
    {
      id: 4,
      top: "35%",
      left: "80%",
      title: "Thùng máy PC RGB",
      price: "$199",
      link: "/products",
    },
  ];

  const toggleHotspot = (id) => {
    setActiveHotspot((current) => (current === id ? null : id));
  };

  return (
    <section className="setup-showcase-section">
      <div className="setup-header">
        <span className="section-label">GÓC CÔNG NGHỆ</span>

        <h2>Kiến tạo góc gaming mơ ước</h2>

        <p>
          Khám phá những thiết bị nổi bật và tìm cảm hứng để xây dựng góc gaming
          mang phong cách riêng của bạn.
        </p>
      </div>

      <div className="setup-container">
        <img
          src="https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
          alt="Không gian bàn máy tính và góc gaming"
          className="setup-image"
          loading="lazy"
        />

        {hotspots.map((spot) => {
          const isActive = activeHotspot === spot.id;

          return (
            <div
              key={spot.id}
              className={`hotspot${isActive ? " is-active" : ""}`}
              style={{ top: spot.top, left: spot.left }}
            >
              <button
                type="button"
                className="hotspot-trigger"
                aria-label={`${isActive ? "Đóng" : "Xem"} thông tin ${spot.title}`}
                aria-expanded={isActive}
                onClick={() => toggleHotspot(spot.id)}
              >
                <span className="hotspot-pulse" aria-hidden="true" />

                <span className="hotspot-icon" aria-hidden="true">
                  {isActive ? "−" : "+"}
                </span>
              </button>

              <div className="hotspot-tooltip">
                <strong>{spot.title}</strong>

                <span className="hotspot-price">{spot.price}</span>

                <Link to={spot.link} onClick={() => setActiveHotspot(null)}>
                  Khám phá sản phẩm
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SetupShowcase;
