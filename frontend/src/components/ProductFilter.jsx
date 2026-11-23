import "./ProductFilter.css";

function ProductFilter({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  maxPrice,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onClear,
}) {
  return (
    <aside className="product-filter">
      <div className="filter-header">
        <h2>Bộc lọc</h2>

        <button className="clear-filter" onClick={onClear}>
          Xóa tất cả
        </button>
      </div>

      <div className="filter-group">
        <h3>Danh mục</h3>

        <div className="filter-options">
          {categories.length > 0 ? (
            categories.map((category) => (
              <label key={category._id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => onCategoryChange(category._id)}
                />

                <span>{category.name}</span>
              </label>
            ))
          ) : (
            <p>Không có danh mục nào.</p>
          )}
        </div>
      </div>

      <div className="filter-group">
        <h3>Thương hiệu</h3>

        <div className="filter-options">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <label key={brand._id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand._id)}
                  onChange={() => onBrandChange(brand._id)}
                />

                <span>{brand.name}</span>
              </label>
            ))
          ) : (
            <p>Không có thương hiệu nào.</p>
          )}
        </div>
      </div>

      <div className="filter-group">
        <h3>Khoảng tiền</h3>

        <input
          type="range"
          min="0"
          max="100000000"
          step="1000000"
          value={maxPrice}
          onChange={(event) => onPriceChange(Number(event.target.value))}
          className="price-range"
        />

        <div className="price-values">
          <span>0₫</span>
          <span>
            {maxPrice >= 100000000
              ? "100.000.000₫+"
              : `${maxPrice.toLocaleString("vi-VN")}₫`}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilter;
