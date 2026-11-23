const API_URL = "http://localhost:3000/api/auth";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Authentication request failed"
    );
  }

  return result;
};

export const loginUser = async (credentials) => {
  const result = await request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  localStorage.setItem("token", result.data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(result.data.user)
  );

  return result;
};

export const registerUser = async (userData) => {
  const result = await request("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  return result;
};

// PUT - Cập nhật hồ sơ cá nhân
export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to update your profile.");
  }

  const result = await request("/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  // Đồng bộ thông tin mới vào localStorage
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const updatedUser = {
    ...currentUser,
    ...result.data,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));

  // Thông báo cho các component đang theo dõi trạng thái tài khoản
  window.dispatchEvent(new Event("authChanged"));

  return result;
};