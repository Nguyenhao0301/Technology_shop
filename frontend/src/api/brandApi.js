const API_URL = "http://localhost:3000/api/brands";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// GET - Lấy danh sách thương hiệu
export const getBrands = async () => {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to get brands");
    }

    return result;
};

// POST - Thêm thương hiệu
export const createBrand = async (brandData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(brandData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create brand");
    }

    return result;
};

// PUT - Cập nhật thương hiệu
export const updateBrand = async (id, brandData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(brandData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update brand");
    }

    return result;
};

// DELETE - Xóa mềm thương hiệu
export const deleteBrand = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to delete brand");
    }

    return result;
};