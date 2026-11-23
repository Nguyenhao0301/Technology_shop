
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMyNotifications,
    markNotificationAsRead,
} = require("../controllers/notificationController");

// Lấy danh sách thông báo của người đăng nhập
router.get("/", authMiddleware, getMyNotifications);

// Đánh dấu một thông báo đã đọc
router.patch("/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
