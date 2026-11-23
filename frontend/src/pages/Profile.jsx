import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../utils/wishlist";
import { updateProfile } from "../api/authApi";
import { getMembership } from "../api/membershipApi";
import "./Profile.css";

const formatVND = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

const membershipTiers = {
  bronze: {
    name: "Bronze",
    discount: 0,
    nextThreshold: 5000000,
    color: "#a16207",
  },
  silver: {
    name: "Silver",
    discount: 2,
    nextThreshold: 15000000,
    color: "#64748b",
  },
  gold: {
    name: "Gold",
    discount: 4,
    nextThreshold: 40000000,
    color: "#b45309",
  },
  diamond: {
    name: "Diamond",
    discount: 6,
    nextThreshold: null,
    color: "#6d28d9",
  },
};

const formatMembershipTier = (tier) => {
  return membershipTiers[tier] || membershipTiers.bronze;
};

function Profile() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState(() => getWishlist());

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [membership, setMembership] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membershipError, setMembershipError] = useState("");

  useEffect(() => {
    const updateWishlist = () => setWishlist(getWishlist());

    window.addEventListener("wishlistChanged", updateWishlist);

    return () => {
      window.removeEventListener("wishlistChanged", updateWishlist);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMembership = async () => {
      try {
        setMembershipLoading(true);
        setMembershipError("");

        const data = await getMembership();

        if (isMounted) {
          setMembership(data);
        }
      } catch (error) {
        if (isMounted) {
          setMembershipError(
            error.message || "Không thể tải thông tin thành viên.",
          );
        }
      } finally {
        if (isMounted) {
          setMembershipLoading(false);
        }
      }
    };

    fetchMembership();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveWishlist = (productId) => {
    removeFromWishlist(productId);
    setWishlist(getWishlist());
  };

  const handleEditProfile = () => {
    setFormName(user.name || "");
    setFormPhone(user.phone || "");
    setProfileError("");
    setProfileSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormName(user.name || "");
    setFormPhone(user.phone || "");
    setProfileError("");
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!formName.trim()) {
      setProfileError("Vui lòng nhập họ và tên.");
      return;
    }

    try {
      setIsSaving(true);

      const result = await updateProfile({
        name: formName.trim(),
        phone: formPhone.trim(),
      });

      // Đồng bộ state user để giao diện cập nhật ngay
      setUser(result.data);
      setFormName(result.data.name || "");
      setFormPhone(result.data.phone || "");

      setIsEditing(false);
      setProfileSuccess("Cập nhật thông tin cá nhân thành công.");
    } catch (error) {
      setProfileError(error.message || "Không thể cập nhật thông tin cá nhân.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials =
    user.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TG";

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <span className="profile-eyebrow">Tài khoản</span>
          <h1>Trang cá nhân và yêu thích</h1>
          <p>
            Quản lý thông tin tài khoản và lưu lại những sản phẩm bạn yêu thích
          </p>
        </header>

        <div className="profile-layout">
          <aside className="profile-card">
            <div className="profile-avatar">{initials}</div>

            {!isEditing ? (
              <>
                <h2>{user.name || "Technology Gamer"}</h2>
                <p>{user.email || "No email available"}</p>
                <span>{user.phone || "No phone number"}</span>

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEditProfile}
                >
                  Chỉnh sửa thông tin cá nhân
                </button>
              </>
            ) : (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <label htmlFor="profile-name">Họ và tên</label>
                <input
                  id="profile-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />

                <label htmlFor="profile-phone">Số điện thoại</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />

                {profileError && (
                  <p className="profile-message profile-error">
                    {profileError}
                  </p>
                )}

                <div className="profile-edit-actions">
                  <button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {profileSuccess && (
              <p className="profile-message profile-success">
                {profileSuccess}
              </p>
            )}

            <Link to="/orders" className="profile-order-link">
              Xem đơn hàng →
            </Link>
          </aside>

          <section className="wishlist-section">
            <div className="wishlist-heading">
              <div>
                <span className="profile-eyebrow">Sản phẩm đã lưu</span>
                <h2>Danh sách yêu thích của tôi</h2>
              </div>

              <span className="wishlist-count">
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "sản phẩm" : "sản phẩm"}
              </span>
            </div>

            {wishlist.length === 0 ? (
              <div className="wishlist-empty">
                <span className="wishlist-empty-icon">♡</span>
                <h3>Đang đợi tải danh sách yêu thích</h3>
                <p>Nhấn vào biếu tượng trái tim để lưu sản phẩm yêu thích.</p>
                <Link to="/products">Khám phá sản phẩm</Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((item) => {
                  const imageUrl = (() => {
                    const image = item.image;

                    if (!image) return "/images/product-placeholder.jpg";

                    if (/^https?:\/\//i.test(image)) return image;

                    if (image.startsWith("/uploads/")) {
                      return `http://localhost:3000${image}`;
                    }

                    return `http://localhost:3000/uploads/products/${image.replace(/^\/+/, "")}`;
                  })();

                  return (
                    <article className="wishlist-item" key={item.productId}>
                      <Link
                        to={`/products/${item.productId}`}
                        className="wishlist-image"
                      >
                        <img
                          src={imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "/images/product-placeholder.jpg";
                          }}
                        />
                      </Link>

                      <div className="wishlist-item-content">
                        <Link to={`/products/${item.productId}`}>
                          {item.name}
                        </Link>

                        <strong>{formatVND(item.price)}</strong>

                        <button
                          type="button"
                          onClick={() => handleRemoveWishlist(item.productId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        {/* Thông tin thành viên */}

        <div className="membership-card">
          <div className="membership-card-header">
            <div>
              <span className="profile-eyebrow">Chương trình thành viên</span>
              <h3>Thành viên Technology Gaming Shop</h3>
            </div>

            {membership && (
              <span
                className="membership-badge"
                style={{
                  backgroundColor: formatMembershipTier(
                    membership.membershipTier,
                  ).color,
                }}
              >
                {formatMembershipTier(membership.membershipTier).name}
              </span>
            )}
          </div>

          {membershipLoading ? (
            <p>Đang tải thông tin thành viên...</p>
          ) : membershipError ? (
            <p className="profile-message profile-error">{membershipError}</p>
          ) : membership ? (
            <>
              <div className="membership-stats">
                <div>
                  <span>Điểm tích lũy</span>
                  <strong>
                    {Number(membership.loyaltyPoints || 0).toLocaleString(
                      "vi-VN",
                    )}
                  </strong>
                  <small>điểm</small>
                </div>

                <div>
                  <span>Chi tiêu 12 tháng</span>
                  <strong>{formatVND(membership.tierSpending || 0)}</strong>
                </div>

                <div>
                  <span>Ưu đãi theo hạng</span>
                  <strong>
                    {formatMembershipTier(membership.membershipTier).discount}%
                  </strong>
                </div>
              </div>

              {membership.membershipTier === "diamond" ? (
                <div className="membership-progress">
                  <strong>Bạn đã đạt hạng thành viên cao nhất!</strong>
                  <p>Cảm ơn bạn đã đồng hành cùng Technology Gaming Shop.</p>
                </div>
              ) : (
                (() => {
                  const tierInfo = formatMembershipTier(
                    membership.membershipTier,
                  );
                  const spending = Number(membership.tierSpending || 0);
                  const nextThreshold = tierInfo.nextThreshold;
                  const progress = Math.min(
                    100,
                    Math.max(0, (spending / nextThreshold) * 100),
                  );

                  const nextTierName = {
                    bronze: "Silver",
                    silver: "Gold",
                    gold: "Diamond",
                  }[membership.membershipTier];

                  return (
                    <div className="membership-progress">
                      <div className="membership-progress-label">
                        <span>Tiến độ lên hạng {nextTierName}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>

                      <div className="membership-progress-track">
                        <div
                          className="membership-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p>
                        Còn {formatVND(Math.max(0, nextThreshold - spending))}{" "}
                        để đạt hạng {nextTierName}.
                      </p>
                    </div>
                  );
                })()
              )}
            </>
          ) : (
            <p>Chưa có thông tin thành viên.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default Profile;
