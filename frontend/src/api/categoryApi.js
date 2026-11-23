const API_URL = "http://localhost:3000/api/categories";

// Hàm dùng chung để gọi API danh mục
const categoryRequest = async (endpoint = "", options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // Chỉ gửi token khi đã đăng nhập
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Có lỗi xảy ra khi xử lý danh mục"
        );
    }

    return result;
};

// Lấy danh sách danh mục đang hoạt động
export const getCategories = async () => {
    return categoryRequest();
};

// Lấy chi tiết danh mục theo ID
export const getCategoryById = async (id) => {
    return categoryRequest(`/${id}`, {
        method: "GET",
    });
};

// Thêm danh mục
export const createCategory = async (categoryData) => {
    return categoryRequest("", {
        method: "POST",
        body: JSON.stringify(categoryData),
    });
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
    return categoryRequest(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
    });
};

// Xóa mềm danh mục
export const deleteCategory = async (id) => {
    return categoryRequest(`/${id}`, {
        method: "DELETE",
    });
};