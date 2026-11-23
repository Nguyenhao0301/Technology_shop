import { useEffect, useState } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brandApi";
import "./BrandManagement.css";

function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
  });
  const [saving, setSaving] = useState(false);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getBrands();
      const brandList = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setBrands(brandList);
    } catch (error) {
      setError(error.message || "Không thể tải thương hiệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", description: "", logo: "" });
    setEditingBrand(null);
    setShowForm(false);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      logo: brand.logo || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên thương hiệu.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim(),
      };

      if (editingBrand) {
        await updateBrand(editingBrand._id, {
          ...payload,
          isActive: editingBrand.isActive,
        });
        alert("Cập nhật thương hiệu thành công!");
      } else {
        await createBrand(payload);
        alert("Thêm thương hiệu thành công!");
      }

      resetForm();
      await loadBrands();
    } catch (error) {
      setError(error.message || "Không thể lưu thương hiệu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa thương hiệu "${name}" không?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteBrand(id);
      alert("Xóa thương hiệu thành công!");
      await loadBrands();
    } catch (error) {
      setError(error.message || "Không thể xóa thương hiệu.");
    }
  };

  if (loading) {
    return (
      <div className="brand-management">
        <p>Đang tải thương hiệu...</p>
      </div>
    );
  }

  return (
    <div className="brand-management">
      <div className="brand-management-header">
        <div>
          <h1>Quản lý thương hiệu</h1>
          <p>Quản lý thông tin thương hiệu của cửa hàng.</p>
        </div>

        <button
          type="button"
          className="brand-btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setError("");
          }}
        >
          + Thêm thương hiệu
        </button>
      </div>

      {error && <div className="brand-management-error">{error}</div>}

      {showForm && (
        <form className="brand-management-form" onSubmit={handleSubmit}>
          <h2>{editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}</h2>

          <label htmlFor="brand-name">Tên thương hiệu *</label>
          <input
            id="brand-name"
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
            required
          />

          <label htmlFor="brand-description">Mô tả</label>
          <textarea
            id="brand-description"
            value={formData.description}
            onChange={(event) =>
              setFormData({
                ...formData,
                description: event.target.value,
              })
            }
            rows={3}
          />

          <label htmlFor="brand-logo">Tên file logo</label>
          <input
            id="brand-logo"
            type="text"
            placeholder="Ví dụ: asus-logo.png"
            value={formData.logo}
            onChange={(event) =>
              setFormData({ ...formData, logo: event.target.value })
            }
          />

          <div className="brand-form-actions">
            <button
              type="submit"
              className="brand-btn-primary"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : editingBrand
                  ? "Lưu thay đổi"
                  : "Thêm thương hiệu"}
            </button>

            <button
              type="button"
              className="brand-btn-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="brand-management-table-wrapper">
        <table className="brand-management-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Tên thương hiệu</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan="5" className="brand-management-empty">
                  Chưa có thương hiệu nào.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id}>
                  <td>
                    {brand.logo ? (
                      <img
                        src={`/images/brands/${brand.logo}`}
                        alt={brand.name}
                        className="brand-management-logo"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>—</span>
                    )}
                  </td>

                  <td>
                    <strong>{brand.name}</strong>
                  </td>

                  <td>{brand.description || "—"}</td>

                  <td>
                    {brand.isActive ? (
                      <span className="brand-status-active">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="brand-status-inactive">
                        Ngừng hoạt động
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="brand-table-actions">
                      <button
                        type="button"
                        className="brand-btn-edit"
                        onClick={() => handleEdit(brand)}
                      >
                        Sửa
                      </button>

                      <button
                        type="button"
                        className="brand-btn-delete"
                        onClick={() => handleDelete(brand._id, brand.name)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BrandManagement;
