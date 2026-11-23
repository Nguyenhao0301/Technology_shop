import { useEffect, useState } from "react";
import {
  getRedeemableVouchers,
  redeemVoucher,
  getMyVouchers,
} from "../api/voucherApi";
import { getMembership } from "../api/membershipApi";
import "./VoucherShop.css";

function formatVND(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " ₫";
}

function formatDate(value) {
  if (!value) return "Không giới hạn";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("vi-VN");
}

function getDiscountText(voucher) {
  if (voucher.discountType === "percentage") {
    return `Giảm ${voucher.discountValue}%`;
  }

  return `Giảm ${formatVND(voucher.discountValue)}`;
}

export default function VoucherShop() {
  const [activeTab, setActiveTab] = useState("shop");
  const [vouchers, setVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [voucherData, myVoucherData, membershipData] = await Promise.all([
        getRedeemableVouchers(),
        getMyVouchers(),
        getMembership(),
      ]);

      setVouchers(Array.isArray(voucherData) ? voucherData : []);
      setMyVouchers(Array.isArray(myVoucherData) ? myVoucherData : []);
      setMembership(membershipData);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu voucher.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRedeem(voucher) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn đổi voucher "${voucher.name}" bằng ${Number(
        voucher.pointsRequired || 0,
      ).toLocaleString("vi-VN")} điểm không?`,
    );

    if (!confirmed) return;

    setRedeemingId(voucher._id);
    setError("");
    setMessage("");

    try {
      const result = await redeemVoucher(voucher._id);

      setMessage(
        result.message ||
          "Đổi voucher thành công! Hãy kiểm tra trong Voucher của tôi.",
      );

      // Tải lại điểm, số lượng voucher và danh sách voucher của khách hàng.
      await loadData();
      setActiveTab("mine");
    } catch (err) {
      setError(err.message || "Đổi voucher thất bại.");
    } finally {
      setRedeemingId(null);
    }
  }

  const loyaltyPoints = Number(membership?.loyaltyPoints || 0);

  if (loading) {
    return (
      <div className="voucher-shop">
        <p>Đang tải dữ liệu voucher...</p>
      </div>
    );
  }

  return (
    <main className="voucher-shop">
      <header className="voucher-shop__header">
        <div>
          <p className="voucher-shop__eyebrow">ĐẶC QUYỀN THÀNH VIÊN</p>
          <h1>Cửa hàng voucher</h1>
          <p>Đổi điểm tích lũy để nhận ưu đãi cho đơn hàng tiếp theo.</p>
        </div>

        <div className="voucher-shop__points">
          <span>Điểm tích lũy của bạn</span>
          <strong>{loyaltyPoints.toLocaleString("vi-VN")}</strong>
          <small>điểm</small>
        </div>
      </header>

      <nav className="voucher-shop__tabs">
        <button
          type="button"
          className={activeTab === "shop" ? "active" : ""}
          onClick={() => {
            setActiveTab("shop");
            setMessage("");
            setError("");
          }}
        >
          Kho voucher
        </button>

        <button
          type="button"
          className={activeTab === "mine" ? "active" : ""}
          onClick={() => {
            setActiveTab("mine");
            setMessage("");
            setError("");
          }}
        >
          Voucher của tôi ({myVouchers.length})
        </button>
      </nav>

      {message && <div className="voucher-shop__notice success">{message}</div>}
      {error && <div className="voucher-shop__notice error">{error}</div>}

      {activeTab === "shop" ? (
        <section className="voucher-shop__grid">
          {vouchers.length === 0 ? (
            <div className="voucher-shop__empty">
              Hiện chưa có voucher nào có thể đổi.
            </div>
          ) : (
            vouchers.map((voucher) => {
              const pointsRequired = Number(voucher.pointsRequired || 0);
              const remainingQuantity = Number(voucher.remainingQuantity ?? 0);
              const enoughPoints = loyaltyPoints >= pointsRequired;
              const available = remainingQuantity > 0;
              const isRedeeming = redeemingId === voucher._id;

              return (
                <article className="voucher-card" key={voucher._id}>
                  <div className="voucher-card__top">
                    <span className="voucher-card__tag">VOUCHER</span>
                    <strong className="voucher-card__discount">
                      {getDiscountText(voucher)}
                    </strong>
                  </div>

                  <div className="voucher-card__body">
                    <h2>{voucher.name}</h2>
                    <p>
                      {voucher.description || "Ưu đãi dành cho thành viên."}
                    </p>

                    <div className="voucher-card__details">
                      <span>
                        Đơn tối thiểu: {formatVND(voucher.minOrderAmount)}
                      </span>

                      {voucher.maxDiscountAmount != null &&
                        voucher.discountType === "percentage" && (
                          <span>
                            Giảm tối đa: {formatVND(voucher.maxDiscountAmount)}
                          </span>
                        )}

                      <span>Hạn sử dụng: {formatDate(voucher.endAt)}</span>

                      <span>Còn lại: {remainingQuantity}</span>
                    </div>
                  </div>

                  <div className="voucher-card__footer">
                    <div>
                      <strong>
                        {pointsRequired.toLocaleString("vi-VN")} điểm
                      </strong>
                      {!enoughPoints && <small>Chưa đủ điểm để đổi</small>}
                    </div>

                    <button
                      type="button"
                      disabled={!available || !enoughPoints || isRedeeming}
                      onClick={() => handleRedeem(voucher)}
                    >
                      {isRedeeming
                        ? "Đang đổi..."
                        : !available
                          ? "Hết voucher"
                          : !enoughPoints
                            ? "Chưa đủ điểm"
                            : "Đổi ngay"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      ) : (
        <section className="voucher-shop__grid">
          {myVouchers.length === 0 ? (
            <div className="voucher-shop__empty">Bạn chưa đổi voucher nào.</div>
          ) : (
            myVouchers.map((item) => {
              const voucher = item.voucherId || item.voucher || item;
              const code = item.code || item.voucherCode || "";

              return (
                <article
                  className="voucher-card voucher-card--owned"
                  key={item._id}
                >
                  <div className="voucher-card__top">
                    <span className="voucher-card__tag">VOUCHER CỦA BẠN</span>
                    <strong className="voucher-card__discount">
                      {getDiscountText(voucher)}
                    </strong>
                  </div>

                  <div className="voucher-card__body">
                    <h2>{voucher.name || "Voucher"}</h2>
                    <p>
                      {voucher.description ||
                        "Sử dụng mã voucher khi đặt hàng."}
                    </p>

                    {code && (
                      <div className="voucher-card__code">
                        <span>Mã voucher</span>
                        <strong>{code}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(code)
                              .then(() => setMessage("Đã sao chép mã voucher."))
                              .catch(() =>
                                setError("Không thể sao chép mã voucher."),
                              );
                          }}
                        >
                          Sao chép mã
                        </button>
                      </div>
                    )}

                    <div className="voucher-card__details">
                      <span>Trạng thái: {item.status || "Đã đổi"}</span>
                      <span>
                        Hết hạn: {formatDate(item.expiresAt || voucher.endAt)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}
    </main>
  );
}
