const API_URL = "http://localhost:3000/api/notifications";

const getToken = () => localStorage.getItem("token");

export const getMyNotifications = async () => {
    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể tải thông báo.");
    }

    return result;
};

export const markNotificationAsRead = async (id) => {
    const response = await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Không thể đánh dấu đã đọc.");
    }

    return result;
};