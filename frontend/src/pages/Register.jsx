import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import "./Login.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Hãy điền đầy đủ thông tin.");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 kí tự trở lên.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (requestError) {
      setError(requestError.message || "Không thể tạo tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-showcase">
        <span className="auth-kicker">THAM GIA CỘNG ĐỒNG</span>
        <h1>Xây dựng góc công nghệ đáng tự hào.</h1>
        <p>
          Tạo tài khoản để lưu sản phẩm yêu thích, theo dõi đơn hàng và quản lý
          mọi nâng cấp thiết bị tại một nơi.
        </p>
      </div>

      <div className="auth-card register-card">
        <div className="login-header">
          <span className="auth-card-label">BẮT ĐẦU NGAY</span>
          <h2>Tạo tài khoản</h2>
          <p>Chỉ mất một phút để bắt đầu.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label htmlFor="register-name">Họ và tên</label>
            <input
              id="register-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Địa chỉ email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-phone">
              Số điện thoại <span>(không bắt buộc)</span>
            </label>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
            />
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label htmlFor="register-password">Mật khẩu</label>
              <input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">
                Xác nhận mật khẩu
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="auth-switch">
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
