import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import { getBrands } from "../api/brandApi";
import "./ProductForm.css";

function ProductEdit() {
  const { id } = useParams();
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

  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productResult, categoryResult, brandResult] = await Promise.all([
          getProductById(id),
          getCategories(),
          getBrands(),
        ]);

        const product = productResult.data;

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

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          category: product.category?._id || product.category || "",
          brand: product.brand?._id || product.brand || "",
          specifications: product.specifications
            ? JSON.stringify(product.specifications, null, 2)
            : "",
        });

        setCurrentImage(product.image || "");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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
      setSaving(true);
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

      // Nếu không chọn ảnh mới,
      // giữ lại tên ảnh hiện tại.
      if (imageFile) {
        data.append("image", imageFile);
      } else if (currentImage) {
        data.append("image", currentImage);
      }

      await updateProduct(id, data);

      alert("Cập nhật sản phẩm thành công!");

      navigate("/admin/products");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product-form-page">
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <div>
          <h1>Sửa sản phẩm</h1>
          <p>Cập nhật thông tin sản phẩm.</p>
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
              rows="8"
            />

            <small>Nhập thông số dưới dạng JSON.</small>
          </div>

          <div className="form-group form-group-full">
            <label>Ảnh hiện tại</label>

            {currentImage ? (
              <div className="product-image-preview">
                <img
                  src={`http://localhost:3000/uploads/products/${currentImage}`}
                  alt={formData.name}
                />
              </div>
            ) : (
              <small>Sản phẩm chưa có ảnh.</small>
            )}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="image">Chọn ảnh mới</label>

            <input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />

            <small>
              Nếu không chọn ảnh mới, ảnh hiện tại sẽ được giữ nguyên.
            </small>

            {imagePreview && (
              <div className="product-image-preview">
                <img src={imagePreview} alt="Ảnh mới" />
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
            disabled={saving}
          >
            {saving ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductEdit;
