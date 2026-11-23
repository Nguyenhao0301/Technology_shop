const API_URL = "http://localhost:3000/api/vouchers";

export const createVoucher = async (voucherData) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để tạo voucher.");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucherData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tạo voucher.");
    }

    return result;
};

export const getVouchers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để xem danh sách voucher.");
    }

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tải danh sách voucher.");
    }

    return result.data;
};


export const updateVoucher = async (id, voucherData) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để cập nhật voucher.");
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucherData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể cập nhật voucher.");
    }

    return result;
};

export const toggleVoucherStatus = async (id, isActive) => {
    return updateVoucher(id, { isActive });
};


export const deleteVoucher = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để xóa voucher.");
    }

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể xóa voucher.");
    }

    return result;
};

// Lấy danh sách voucher khách hàng có thể đổi
export const getRedeemableVouchers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để xem voucher.");
    }

    const response = await fetch(`${API_URL}/redeemable`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tải voucher có thể đổi.");
    }

    return result.data;
};

// Đổi voucher bằng điểm tích lũy
export const redeemVoucher = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để đổi voucher.");
    }

    const response = await fetch(`${API_URL}/${id}/redeem`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể đổi voucher.");
    }

    return result;
};

// Lấy danh sách voucher khách hàng đã đổi
export const getMyVouchers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vui lòng đăng nhập để xem voucher của bạn.");
    }

    const response = await fetch(`${API_URL}/my-vouchers`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tải voucher của bạn.");
    }

    return result.data;
};
