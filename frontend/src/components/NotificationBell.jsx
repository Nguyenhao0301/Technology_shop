import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../api/notificationApi";
import "./NotificationBell.css";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setError("");
      const result = await getMyNotifications();

      setNotifications(result.data || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      setError(err.message || "Không thể tải thông báo.");
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleNotifications = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      setIsOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật thông báo.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-bell"
        onClick={toggleNotifications}
        title="Thông báo"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" className="notification-icon">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="notification-backdrop"
            aria-label="Đóng thông báo"
            onClick={() => setIsOpen(false)}
          />

          <div className="notification-panel">
            <div className="notification-header">
              <div>
                <h3>Thông báo</h3>
                <p>{unreadCount} thông báo chưa đọc</p>
              </div>

              <button
                type="button"
                className="notification-close"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="notification-list">
              {loading ? (
                <p className="notification-state">Đang tải thông báo...</p>
              ) : error ? (
                <p className="notification-state notification-error">{error}</p>
              ) : notifications.length === 0 ? (
                <p className="notification-state">Bạn chưa có thông báo nào.</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification._id}
                    className={`notification-item ${
                      notification.isRead ? "" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span
                      className={`notification-type-icon ${notification.type}`}
                    >
                      {notification.type === "promotion"
                        ? "％"
                        : notification.type === "back_in_stock"
                          ? "↻"
                          : "i"}
                    </span>

                    <span className="notification-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>
                        {new Date(notification.createdAt).toLocaleString(
                          "vi-VN",
                        )}
                      </small>
                    </span>

                    {!notification.isRead && (
                      <span className="notification-unread-dot" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
