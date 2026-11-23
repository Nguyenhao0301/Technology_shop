import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ adminOnly = false }) {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    user = null;
  }

  // Chưa đăng nhập
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu route yêu cầu admin nhưng tài khoản không phải admin
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
