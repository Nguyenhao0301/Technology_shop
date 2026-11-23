import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-showcase">
        <span className="auth-kicker">TECHNOLOGY & GAMING</span>
        <h1>Nâng tầm không gian công nghệ của bạn</h1>
        <p>Đăng nhập để lưu giữ danh sách yêu thích, theo dõi đơn hàng và quản lý mọi thiết bị gaming của bạn tại một nơi.</p>
      </div>
      <div className="login-container auth-card">
        <div className="login-header">
          <span className="auth-card-label">Chào mừng trở lại!</span>
          <h2>Đăng nhập</h2>
          <p>Trải nghiệm mua sắm dành riêng cho bạn</p>
        </div>

        {notice && <div className="login-notice">{notice}</div>}
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="field-label-row">
              <label htmlFor="login-password">Mật khẩu</label>
              <span>Bắt buộc</span>
            </div>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">
          Lần đầu đến với Technology & Gaming? <Link to="/register">Tạo tài khoản mới ngay!</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
