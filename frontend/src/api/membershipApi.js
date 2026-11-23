const API_URL = "http://localhost:3000/api";

export const getMembership = async () => {
const token = localStorage.getItem("token");

if (!token) {
throw new Error("Vui lòng đăng nhập để xem thông tin thành viên.");
}

const response = await fetch(`${API_URL}/membership`, {
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
},
});

const result = await response.json();

if (!response.ok) {
throw new Error(
result.message || "Không thể tải thông tin thành viên."
);
}

return result.data;
};