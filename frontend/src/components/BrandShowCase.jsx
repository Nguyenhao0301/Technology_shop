import { Link } from "react-router-dom";
import "./BrandShowcase.css";

const brands = [
  {
    id: "asus",
    name: "ASUS",
    logo: "/brands/asus.png",
    description: "Gaming & Technology",
  },
  {
    id: "msi",
    name: "MSI",
    logo: "/brands/msi.png",
    description: "Gaming Performance",
  },
  {
    id: "logitech",
    name: "Logitech",
    logo: "/brands/logitech.png",
    description: "Gaming Peripherals",
  },
  {
    id: "lg",
    name: "LG",
    logo: "/brands/lg.png",
    description: "Display & Technology",
  },
  {
    id: "razer",
    name: "Razer",
    logo: "/brands/razer.png",
    description: "For Gamers",
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/brands/samsung.png",
    description: "Innovation & Technology",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    logo: "/brands/lenovo.png",
    description: "Computing & Gaming",
  },
  {
    id: "sony",
    name: "Sony",
    logo: "/brands/sony.png",
    description: "Entertainment & Audio",
  },
];

function BrandShowcase() {
  return (
    <section className="brand-showcase">
      <div className="brand-header">
        <div>
          <span className="section-label">THƯƠNG HIỆU UY TÍN</span>

          <h2>
            Thương hiệu hàng đầu.
            <br />
            <span>Công nghệ vượt trội.</span>
          </h2>

          <p>
            Khám phá các sản phẩm đến từ những thương hiệu công nghệ và gaming
            hàng đầu thế giới.
          </p>
        </div>

        <Link to="/brands" className="view-brands">
          Xem tất cả thương hiệu
          <span>→</span>
        </Link>
      </div>

      <div className="brands-grid">
        {brands.map((brand) => (
          <Link
            to={`/brands/${brand.id}`}
            className="brand-card"
            key={brand.id}
          >
            <div className="brand-logo">
              <img src={brand.logo} alt={brand.name} />
            </div>

            <div className="brand-info">
              <h3>{brand.name}</h3>

              <p>{brand.description}</p>
            </div>

            <span className="brand-arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BrandShowcase;
