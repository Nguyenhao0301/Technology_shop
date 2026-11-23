import { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../api/categoryApi";
import "./CategoryManagement.css";

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCategories();

      const categoryList = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setCategories(categoryList);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(id);
      alert("Xóa danh mục thành công!");
      await loadCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="category-management">
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="category-management-header">
        <div>
          <h1>Quản lý danh mục</h1>
          <p>Quản lý các danh mục sản phẩm của cửa hàng.</p>
        </div>
      </div>

      {error && (
        <div className="category-management-error">{error}</div>
      )}

      <div className="category-management-table-wrapper">
        <table className="category-management-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="category-management-empty">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    {category.image ? (
                      <img
                        src={`/categories/${category.image}`}
                        alt={category.name}
                        className="category-management-image"
                      />
                    ) : (
                      <div className="category-management-no-image">
                        Không có ảnh
                      </div>
                    )}
                  </td>

                  <td>
                    <strong>{category.name}</strong>
                  </td>

                  <td>
                    {category.description || "—"}
                  </td>

                  <td>
                    {category.isActive ? (
                      <span className="category-status-active">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="category-status-inactive">
                        Ngừng hoạt động
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="category-btn-delete"
                      onClick={() =>
                        handleDelete(category._id, category.name)
                      }
                    >
                      Xóa
                    </button>
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

export default CategoryManagement;