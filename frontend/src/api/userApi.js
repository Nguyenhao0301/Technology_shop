const API_URL = "http://localhost:3000/api/users";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Lấy danh sách người dùng
export const getUsers = async () => {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tải danh sách người dùng.");
    }

    return result;
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, userData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể cập nhật người dùng.");
    }

    return result;
};

// Vô hiệu hóa tài khoản người dùng
export const deleteUser = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể vô hiệu hóa tài khoản.");
    }

    return result;
};