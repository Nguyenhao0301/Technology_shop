
const Notification = require("../models/Notification");

// Lấy danh sách thông báo của người dùng đang đăng nhập
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const notifications = await Notification.find({
            user: userId,
        })
            .populate("product", "name image price discountPrice")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false,
        });

        return res.status(200).json({
            message: "Get notifications successfully!",
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            message: "Failed to get notifications.",
        });
    }
};

// Đánh dấu một thông báo là đã đọc
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.userId,
            },
            {
                isRead: true,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found.",
            });
        }

        return res.status(200).json({
            message: "Notification marked as read successfully!",
            data: notification,
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid notification ID.",
            });
        }

        return res.status(500).json({
            message: "Failed to mark notification as read.",
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
};
