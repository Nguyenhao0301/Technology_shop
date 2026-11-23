import { useEffect, useState } from "react";
import "./Testimonials.css";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:3000/api/reviews/featured",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Không thể tải đánh giá.");
        }

        const result = await response.json();

        const reviewData = result?.data?.reviews ?? result?.data;
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Lỗi tải đánh giá:", err);
        setError("Chưa thể tải đánh giá khách hàng.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, []);

  const renderHeader = (description) => (
    <div className="testimonials-header">
      <span className="section-label">CỘNG ĐỒNG</span>
      <h2>Khách hàng nói gì?</h2>
      <p>{description}</p>
    </div>
  );

  if (loading) {
    return (
      <section className="testimonials-section">
        {renderHeader("Đang tải đánh giá khách hàng...")}
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <section className="testimonials-section">
        {renderHeader(error || "Hiện chưa có đánh giá phù hợp để hiển thị.")}
      </section>
    );
  }

  const renderReviewCard = (review, index) => {
    const rating = Math.min(
      5,
      Math.max(0, Math.round(Number(review.rating) || 0)),
    );

    const customerName = review.user?.name || "Khách hàng";
    const avatar = review.user?.avatar;
    const productName = review.product?.name || "Sản phẩm công nghệ";
    const comment = review.comment || "Khách hàng chưa để lại nội dung.";

    return (
      <article
        key={`${review._id || "review"}-${index}`}
        className="testimonial-card"
      >
        <div className="rating" role="img" aria-label={`${rating} trên 5 sao`}>
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>

        <p className="review-text">“{comment}”</p>

        <div className="user-info">
          <div className="user-avatar">
            {avatar ? (
              <img src={avatar} alt="" loading="lazy" />
            ) : (
              customerName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <strong title={customerName}>{customerName}</strong>
            <span title={productName}>{productName}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="testimonials-section">
      {renderHeader("Những chia sẻ thực tế từ khách hàng của chúng tôi.")}

      <div className="marquee-wrapper">
        <div
          className="marquee-track"
          tabIndex={0}
          aria-label="Danh sách đánh giá khách hàng"
        >
          {reviews.map((review, index) => renderReviewCard(review, index))}

          {reviews.map((review, index) =>
            renderReviewCard(review, index + reviews.length),
          )}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
