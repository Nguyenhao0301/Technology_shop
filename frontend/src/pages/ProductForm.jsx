import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import { getBrands } from "../api/brandApi";
import "./ProductForm.css";

function ProductForm() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    specifications: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [categoryResult, brandResult] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        const categoryList = Array.isArray(categoryResult.data)
          ? categoryResult.data
          : Array.isArray(categoryResult)
            ? categoryResult
            : [];

        const brandList = Array.isArray(brandResult.data)
          ? brandResult.data
          : Array.isArray(brandResult)
            ? brandResult
            : [];

        setCategories(categoryList);
        setBrands(brandList);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      if (formData.brand) {
        data.append("brand", formData.brand);
      }

      if (formData.specifications.trim()) {
        JSON.parse(formData.specifications);

        data.append("specifications", formData.specifications);
      }

      if (imageFile) {
        data.append("image", imageFile);
      }

      await createProduct(data);

      alert("Thêm sản phẩm thành công!");

      navigate("/admin/products");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="product-form-page">
        <p>Đang tải danh mục và thương hiệu...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <div>
          <h1>Thêm sản phẩm</h1>
          <p>Thêm sản phẩm mới vào cửa hàng.</p>
        </div>

        <Link to="/admin/products" className="product-form-back">
          ← Quay lại
        </Link>
      </div>

      {error && <div className="product-form-error">{error}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="product-form-grid">
          <div className="form-group form-group-full">
            <label htmlFor="name">Tên sản phẩm</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: ASUS ROG Strix G16"
              required
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Mô tả</label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Giá</label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Tồn kho</label>

            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục</label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn danh mục --</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="brand">Thương hiệu</label>

            <select
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            >
              <option value="">-- Chọn thương hiệu --</option>

              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="specifications">Thông số kỹ thuật</label>

            <textarea
              id="specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              placeholder={`Ví dụ:
{
  "CPU": "Intel Core i7",
  "RAM": "16GB",
  "GPU": "RTX 4060"
}`}
              rows="8"
            />

            <small>Nhập thông số dưới dạng JSON.</small>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="image">Ảnh sản phẩm</label>

            <input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />

            <small>Chấp nhận JPG, JPEG, PNG, WEBP. Tối đa 5MB.</small>

            {imagePreview && (
              <div className="product-image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className="product-form-actions">
          <Link to="/admin/products" className="product-form-cancel">
            Hủy
          </Link>

          <button
            type="submit"
            className="product-form-submit"
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
