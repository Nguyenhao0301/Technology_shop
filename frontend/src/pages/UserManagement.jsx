import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser } from "../api/userApi";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getUsers();
      const userList = Array.isArray(result.data) ? result.data : [];

      setUsers(userList);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "customer",
      isActive: user.isActive ?? true,
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "customer",
      isActive: true,
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingUser) return;

    try {
      setSaving(true);

      await updateUser(editingUser._id, formData);

      alert("Cập nhật người dùng thành công!");
      handleCancel();
      await loadUsers();
    } catch (err) {
      alert(err.message || "Không thể cập nhật người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn vô hiệu hóa tài khoản "${user.name}" không?`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(user._id);

      alert("Đã vô hiệu hóa tài khoản.");
      await loadUsers();
    } catch (err) {
      alert(err.message || "Không thể vô hiệu hóa tài khoản.");
    }
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản và trạng thái người dùng.</p>
        </div>

        <div className="user-management__total">
          Tổng số: <strong>{users.length}</strong> người dùng
        </div>
      </div>

      {error && <div className="user-management__error">{error}</div>}

      {editingUser && (
        <form className="user-management__form" onSubmit={handleSubmit}>
          <h2>Cập nhật người dùng</h2>

          <div className="user-management__form-grid">
            <label>
              Họ và tên
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Số điện thoại
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Vai trò
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="customer">Khách hàng</option>
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </label>
          </div>

          <label className="user-management__active">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Tài khoản đang hoạt động
          </label>

          <div className="user-management__form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            <button
              type="button"
              className="user-management__cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="user-management__table-wrapper">
        {loading ? (
          <p className="user-management__message">
            Đang tải danh sách người dùng...
          </p>
        ) : error ? (
          <p className="user-management__message">
            Không thể hiển thị dữ liệu.
          </p>
        ) : users.length === 0 ? (
          <p className="user-management__message">Chưa có người dùng nào.</p>
        ) : (
          <table className="user-management__table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>

                  <td>
                    <div className="user-management__identity">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="user-management__avatar"
                        />
                      ) : (
                        <div className="user-management__avatar-placeholder">
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span>{user.name}</span>
                    </div>
                  </td>

                  <td>{user.email}</td>
                  <td>{user.phone || "Chưa cập nhật"}</td>

                  <td>
                    <span
                      className={`user-management__role user-management__role--${user.role}`}
                    >
                      {user.role === "admin"
                        ? "Quản trị viên"
                        : user.role === "staff"
                          ? "Nhân viên"
                          : "Khách hàng"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`user-management__status ${
                        user.isActive
                          ? "user-management__status--active"
                          : "user-management__status--inactive"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Đã vô hiệu hóa"}
                    </span>
                  </td>

                  <td>
                    <div className="user-management__actions">
                      <button
                        type="button"
                        className="user-management__edit"
                        onClick={() => handleEdit(user)}
                      >
                        Sửa
                      </button>

                      {user.isActive && (
                        <button
                          type="button"
                          className="user-management__delete"
                          onClick={() => handleDelete(user)}
                        >
                          Vô hiệu hóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
