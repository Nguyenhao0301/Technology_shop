import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../api/productApi";
import "./ProductDetail.css";
import { addToCart } from "../utils/cart";
import { isInWishlist, toggleWishlist } from "../utils/wishlist";
import { getReviewsByProduct, createReview } from "../api/reviewApi";
import ProductQA from "../components/ProductQA";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import RelatedProducts from "../components/RelatedProducts";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const wishlisted =
    product && wishlistVersion >= 0 && isInWishlist(product._id);

  const handleAddToCart = () => {
    addToCart(product, quantity);

    alert(`Added ${quantity} ${product.name} to cart`);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    setWishlistVersion((version) => version + 1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setSubmitReviewError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setSubmitReviewError("");

      const result = await createReview({
        productId: id,
        rating: rating,
        comment: comment.trim(),
      });

      console.log("Review created:", result);

      // Thêm review mới vào giao diện ngay lập tức
      setReviews((prevReviews) => [result.data, ...prevReviews]);
      setHasSubmittedReview(true);
      setRating(5);
      setComment("");

      alert("Gửi đánh giá thành công!");
    } catch (error) {
      console.error("Submit review error:", error);

      setSubmitReviewError(error.message || "Không thể gửi đánh giá.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProductById(id);

        setProduct(result.data);
        addRecentlyViewed(result.data);
      } catch (error) {
        console.error(error);

        setError(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        setReviewError("");

        const result = await getReviewsByProduct(id);

        setReviews(result.data.reviews || []);
      } catch (error) {
        console.error(error);

        setReviewError(error.message || "Failed to load reviews");
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="product-not-found">
          <h1>Loading...</h1>

          <p>Loading product information...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="product-not-found">
          <h1>Product Not Found</h1>

          <p>{error || "The product you are looking for does not exist."}</p>

          <Link to="/products">← Back to Products</Link>
        </div>
      </main>
    );
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>

        <span>/</span>

        <Link to="/products">Sản phẩm</Link>

        <span>/</span>

        <span>{product.name}</span>
      </div>

      <section className="product-detail">
        <div className="product-detail-image">
          <img
            src={
              product.image
                ? `http://localhost:3000/uploads/products/${product.image}`
                : "/images/product-placeholder.jpg"
            }
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/product-placeholder.jpg";
            }}
          />
        </div>

        <div className="product-detail-info">
          <span className="product-detail-brand">{product.brand?.name}</span>

          <h1>{product.name}</h1>

          <div className="product-detail-rating">
            <span className="stars">
              {reviews.length > 0
                ? "★".repeat(
                    Math.round(
                      reviews.reduce((sum, review) => sum + review.rating, 0) /
                        reviews.length,
                    ),
                  )
                : "☆☆☆☆☆"}
            </span>

            <strong>
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, review) => sum + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </strong>

            <span>
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>

          <div className="product-detail-price">
            {Number(product.price).toLocaleString("vi-VN")}₫
          </div>

          <div className="product-detail-stock">
            {product.stock > 0 ? (
              <span className="in-stock">● Còn hàng ({product.stock})</span>
            ) : (
              <span className="out-of-stock">● Hết hàng</span>
            )}
          </div>

          <p className="product-detail-description">{product.description}</p>
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <section className="product-specifications">
                <div className="specifications-header">
                  <h2>Thông số kỹ thuật</h2>
                  <p>Thông tin chi tiết về sản phẩm</p>
                </div>

                <div className="specifications-table">
                  {Object.entries(product.specifications).map(
                    ([key, value], index) => (
                      <div
                        className={`specification-row ${
                          index % 2 === 0 ? "specification-row-even" : ""
                        }`}
                        key={key}
                      >
                        <span className="specification-key">{key}</span>
                        <strong className="specification-value">
                          {String(value)}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}
          <div className="quantity-section">
            <span>Số lượng</span>

            <div className="quantity-control">
              <button onClick={decreaseQuantity} disabled={quantity <= 1}>
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={increaseQuantity}
                disabled={product.stock === 0 || quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-detail-actions">
            <button
              className="add-to-cart-btn"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>

            <button
              className="wishlist-detail-btn"
              aria-label={
                wishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"
              }
              onClick={handleWishlist}
            >
              {wishlisted ? "♥" : "♡"}
            </button>
          </div>

          <div className="product-detail-meta">
            <div>
              <span>Danh mục</span>
              <strong>{product.category?.name}</strong>
            </div>
            <div>
              <span>Thương hiệu</span>
              <strong>{product.brand?.name}</strong>
            </div>
            <div>
              <span>Tồn kho</span>
              <strong>{product.stock}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="product-reviews">
        <div className="product-reviews-header">
          <h2>Đánh giá từ khách hàng</h2>

          <span>
            {reviews.length} {reviews.length === 1 ? "lượt đánh giá" : "lượt đánh giá"}
          </span>
        </div>

        {reviewLoading && <p className="review-message">Đang tải đánh giá...</p>}

        {reviewError && <p className="review-error">{reviewError}</p>}

        {!reviewLoading && !reviewError && reviews.length === 0 && (
          <div className="no-reviews">
            <p>Chưa có đánh giá nào</p>

            <span>Hãy là người đầu tiên đánh giá sản phẩm này</span>
          </div>
        )}

        {!reviewLoading && !reviewError && (
          <div className="review-list">
            {/* WRITE A REVIEW */}
            {!hasSubmittedReview && (
              <div className="write-review">
                <h2>Viết đánh giá</h2>

                <form onSubmit={handleSubmitReview}>
                  <div className="review-rating-input">
                    <label>Điểm đánh giá</label>

                    <div className="rating-buttons">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={
                            value <= rating
                              ? "rating-star active"
                              : "rating-star"
                          }
                          onClick={() => setRating(value)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="review-comment-input">
                    <label htmlFor="review-comment">Nội dung đánh giá</label>

                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      rows="5"
                      required
                    />
                  </div>

                  {submitReviewError && (
                    <p className="review-submit-error">{submitReviewError}</p>
                  )}

                  <button
                    type="submit"
                    className="submit-review-btn"
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              </div>
            )}
            {/* DANH SÁCH REVIEW */}
            {reviews.length > 0 &&
              reviews.map((review) => (
                <div className="review-item" key={review._id}>
                  <div className="review-user">
                    <div className="review-avatar">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} />
                      ) : (
                        <span>
                          {review.user?.name?.charAt(0).toUpperCase() || "C"}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3>{review.user?.name || "Khách hàng"}</h3>

                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      <RelatedProducts productId={product._id} />

      <ProductQA />
    </main>
  );
}

export default ProductDetail;
