import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./Products.css";
import ProductFilter from "../components/ProductFilter";
import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import { getBrands } from "../api/brandApi";

function Products() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const brandFromUrl = searchParams.get("brand");

  const [selectedCategories, setSelectedCategories] = useState(() =>
    categoryFromUrl ? [categoryFromUrl] : [],
  );

  const [selectedBrands, setSelectedBrands] = useState(() =>
    brandFromUrl ? [brandFromUrl] : [],
  );

  const [maxPrice, setMaxPrice] = useState(100000000);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12,
    totalPages: 1,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategories(categoryFromUrl ? [categoryFromUrl] : []);
    setSelectedBrands(brandFromUrl ? [brandFromUrl] : []);
    setCurrentPage(1);
  }, [categoryFromUrl, brandFromUrl]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesResult, brandsResult] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        console.log("CATEGORIES RESULT:", categoriesResult);

        console.log("BRANDS RESULT:", brandsResult);

        setCategories(categoriesResult.data);

        setBrands(brandsResult.data);
      } catch (error) {
        console.error("Get filters error:", error);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProducts({
          category: selectedCategories,
          brand: selectedBrands,
          search,
          sort,
          minPrice: 0,
          maxPrice,
          page: currentPage,
          limit: 12,
        });

        console.log("Selected categories:", selectedCategories);
        console.log(
          "Products returned:",
          result.data.map((p) => ({
            name: p.name,
            category: p.category?.name,
          })),
        );

        setProducts(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Get products error:", error);
        setError(error.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedBrands, maxPrice, search, sort, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((item) => item !== categoryId);
      }

      return [...prev, categoryId];
    });
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((item) => item !== brandId);
      }

      return [...prev, brandId];
    });
  };

  const handlePriceChange = (price) => {
    setMaxPrice(price);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(100000000);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <main className="products-page">
        <h2>Không thể tải danh sách sản phẩm</h2>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="products-page">
      <section className="products-header">
        <div className="products-header-inner">
          <div className="products-heading">
            <span className="products-label">CÔNG NGHỆ & GAMING</span>
            <h1>Khám phá sản phẩm.</h1>
            <p>
              Khám phá các thiết bị công nghệ và gaming mạnh mẽ, đáp ứng mọi nhu
              cầu trong thế giới số của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="products-content">
        <div className="products-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span> / </span>
          <span>Sản phẩm</span>
        </div>

        <div className="products-toolbar">
          <div className="products-search">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="products-count">
            <strong>{pagination.totalProducts}</strong> sản phẩm
          </div>

          <select
            className="products-sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
            <option value="name_asc">Tên: A đến Z</option>
            <option value="name_desc">Tên: Z đến A</option>
          </select>
        </div>

        <div className="products-layout">
          <ProductFilter
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onClear={handleClearFilters}
          />

          <div className="products-grid">
            {loading ? (
              <div className="products-loading">
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="no-products">
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="products-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Trang trước
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Products;
