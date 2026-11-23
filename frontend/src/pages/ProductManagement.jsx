import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/productApi";
import "./ProductManagement.css";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getProducts();

      const productList = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setProducts(productList);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(id);

      alert("Xóa sản phẩm thành công!");

      loadProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="product-management">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="product-management-header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý danh sách sản phẩm của cửa hàng.</p>
        </div>

        <Link to="/admin/products/create" className="product-management-add">
          + Thêm sản phẩm
        </Link>
      </div>

      {error && <div className="product-management-error">{error}</div>}

      <div className="product-management-table-wrapper">
        <table className="product-management-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="product-management-empty">
                  Chưa có sản phẩm.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image ? (
                      <img
                        src={`http://localhost:3000/uploads/products/${product.image}`}
                        alt={product.name}
                        className="product-management-image"
                      />
                    ) : (
                      <div className="product-management-no-image">
                        No image
                      </div>
                    )}
                  </td>

                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{Number(product.price).toLocaleString("vi-VN")} ₫</td>

                  <td>{product.stock}</td>

                  <td>{product.category?.name || "—"}</td>

                  <td>{product.brand?.name || "—"}</td>

                  <td>
                    {product.isActive ? (
                      <span className="status-active">Đang bán</span>
                    ) : (
                      <span className="status-inactive">Ngừng bán</span>
                    )}
                  </td>

                  <td>
                    <div className="product-management-actions">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="btn-edit"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDelete(product._id, product.name)}
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

export default ProductManagement;
