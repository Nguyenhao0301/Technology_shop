import { useEffect, useState } from "react";
import "./VoucherManagement.css";
import {
  createVoucher,
  getVouchers,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
} from "../api/voucherApi";

function VoucherManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "fixed",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "0",
    pointsRequired: "",
    totalQuantity: "",
    startAt: "",
    endAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [vouchers, setVouchers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (voucher) => {
    setEditingId(voucher._id);

    setFormData({
      name: voucher.name || "",
      description: voucher.description || "",
      discountType: voucher.discountType || "fixed",
      discountValue: String(voucher.discountValue ?? ""),
      maxDiscountAmount:
        voucher.maxDiscountAmount == null
          ? ""
          : String(voucher.maxDiscountAmount),
      minOrderAmount: String(voucher.minOrderAmount ?? 0),
      pointsRequired: String(voucher.pointsRequired ?? ""),
      totalQuantity: String(voucher.totalQuantity ?? ""),
      startAt: voucher.startAt
        ? new Date(
            new Date(voucher.startAt).getTime() -
              new Date(voucher.startAt).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)
        : "",
      endAt: voucher.endAt
        ? new Date(
            new Date(voucher.endAt).getTime() -
              new Date(voucher.endAt).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)
        : "",
    });

    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (voucher) => {
    const action = voucher.isActive ? "tắt" : "bật";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${action} voucher "${voucher.name}" không?`,
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const result = await toggleVoucherStatus(voucher._id, !voucher.isActive);

      const updatedVouchers = await getVouchers();
      setVouchers(updatedVouchers);

      setMessage(
        result.message ||
          `${voucher.isActive ? "Tắt" : "Bật"} voucher thành công!`,
      );
    } catch (requestError) {
      setError(
        requestError.message || "Không thể thay đổi trạng thái voucher.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (voucher) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa voucher "${voucher.name}" không?`,
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const result = await deleteVoucher(voucher._id);

      // Cập nhật danh sách sau khi xóa thành công
      const updatedVouchers = await getVouchers();
      setVouchers(updatedVouchers);

      setMessage(result.message || "Xóa voucher thành công!");
    } catch (requestError) {
      setError(requestError.message || "Không thể xóa voucher.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoadingList(true);
        setListError("");

        const data = await getVouchers();
        setVouchers(data);
      } catch (error) {
        setListError(error.message || "Không thể tải danh sách voucher.");
      } finally {
        setLoadingList(false);
      }
    };

    loadVouchers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const startDate = new Date(formData.startAt);
    const endDate = new Date(formData.endAt);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    const voucherData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      maxDiscountAmount:
        formData.maxDiscountAmount === ""
          ? null
          : Number(formData.maxDiscountAmount),
      minOrderAmount: Number(formData.minOrderAmount || 0),
      pointsRequired: Number(formData.pointsRequired),
      totalQuantity: Number(formData.totalQuantity),
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    };

    try {
      setLoading(true);

      let result;

      if (editingId) {
        result = await updateVoucher(editingId, voucherData);
      } else {
        result = await createVoucher(voucherData);
      }

      const updatedVouchers = await getVouchers();
      setVouchers(updatedVouchers);

      setMessage(
        result.message ||
          (editingId
            ? "Cập nhật voucher thành công!"
            : "Tạo voucher thành công!"),
      );

      setFormData({
        name: "",
        description: "",
        discountType: "fixed",
        discountValue: "",
        maxDiscountAmount: "",
        minOrderAmount: "0",
        pointsRequired: "",
        totalQuantity: "",
        startAt: "",
        endAt: "",
      });

      setEditingId(null);
      setShowForm(false);
    } catch (requestError) {
      setError(
        requestError.message ||
          (editingId
            ? "Đã xảy ra lỗi khi cập nhật voucher."
            : "Đã xảy ra lỗi khi tạo voucher."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voucher-management">
      <div className="voucher-header">
        <div>
          <h1>Quản lý voucher</h1>
          <p>Tạo và quản lý voucher đổi bằng điểm thành viên.</p>
        </div>

        <button
          type="button"
          className="voucher-create-btn"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Đóng biểu mẫu" : "+ Tạo voucher"}
        </button>
      </div>

      {message && <p className="voucher-success">{message}</p>}
      {error && <p className="voucher-error">{error}</p>}
      {showForm && (
        <form className="voucher-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Chỉnh sửa voucher" : "Thông tin voucher"}</h2>

          <div className="voucher-form-grid">
            <div className="voucher-field">
              <label htmlFor="name">Tên voucher *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Voucher Gaming 50K"
                required
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="description">Mô tả</label>
              <input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chương trình voucher"
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="discountType">Loại giảm giá *</label>
              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
              >
                <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                <option value="percentage">Giảm theo phần trăm (%)</option>
              </select>
            </div>

            <div className="voucher-field">
              <label htmlFor="discountValue">
                Giá trị giảm{" "}
                {formData.discountType === "fixed" ? "(VNĐ)" : "(%)"} *
              </label>
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                min="1"
                max={formData.discountType === "percentage" ? "100" : undefined}
                value={formData.discountValue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="maxDiscountAmount">Giảm tối đa (VNĐ)</label>
              <input
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                type="number"
                min="0"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="Để trống nếu không giới hạn"
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="minOrderAmount">
                Giá trị đơn tối thiểu (VNĐ)
              </label>
              <input
                id="minOrderAmount"
                name="minOrderAmount"
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={handleChange}
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="pointsRequired">Điểm cần đổi *</label>
              <input
                id="pointsRequired"
                name="pointsRequired"
                type="number"
                min="1"
                step="1"
                value={formData.pointsRequired}
                onChange={handleChange}
                required
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="totalQuantity">Số lượng voucher *</label>
              <input
                id="totalQuantity"
                name="totalQuantity"
                type="number"
                min="1"
                step="1"
                value={formData.totalQuantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="startAt">Thời gian bắt đầu *</label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="voucher-field">
              <label htmlFor="endAt">Thời gian kết thúc *</label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="voucher-form-actions">
            <button
              type="submit"
              className="voucher-create-btn"
              disabled={loading}
            >
              {loading
                ? "Đang xử lý..."
                : editingId
                  ? "Lưu thay đổi"
                  : "Tạo voucher"}
            </button>

            <button
              type="button"
              className="voucher-cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="voucher-list-panel">
        <h2>Danh sách voucher</h2>

        {loadingList ? (
          <p className="voucher-empty">Đang tải danh sách voucher...</p>
        ) : listError ? (
          <p className="voucher-error">{listError}</p>
        ) : vouchers.length === 0 ? (
          <p className="voucher-empty">Chưa có voucher nào.</p>
        ) : (
          <div className="voucher-table-wrapper">
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Tên voucher</th>
                  <th>Giảm giá</th>
                  <th>Điểm đổi</th>
                  <th>Số lượng</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td>
                      <strong>{voucher.name}</strong>
                      <small>{voucher.description || "Không có mô tả"}</small>
                    </td>

                    <td>
                      {voucher.discountType === "percentage"
                        ? `${voucher.discountValue}%`
                        : `${Number(voucher.discountValue).toLocaleString("vi-VN")} ₫`}
                    </td>

                    <td>
                      {Number(voucher.pointsRequired).toLocaleString("vi-VN")}
                    </td>

                    <td>
                      {voucher.remainingQuantity} / {voucher.totalQuantity}
                    </td>

                    <td>
                      <small>
                        {new Date(voucher.startAt).toLocaleString("vi-VN")}
                      </small>
                      <small>
                        đến {new Date(voucher.endAt).toLocaleString("vi-VN")}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`voucher-status ${
                          voucher.isActive ? "is-active" : "is-inactive"
                        }`}
                      >
                        {voucher.isActive ? "Đang bật" : "Đã tắt"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="voucher-edit-btn"
                        onClick={() => handleEdit(voucher)}
                      >
                        Sửa
                      </button>

                      <button
                        type="button"
                        className={`voucher-toggle-btn ${
                          voucher.isActive ? "is-active" : "is-inactive"
                        }`}
                        onClick={() => handleToggleStatus(voucher)}
                        disabled={loading}
                      >
                        {voucher.isActive ? "Tắt" : "Bật"}
                      </button>

                      <button
                        type="button"
                        className="voucher-delete-btn"
                        onClick={() => handleDeleteVoucher(voucher)}
                        disabled={loading}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoucherManagement;
