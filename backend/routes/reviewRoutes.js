const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createReview,
    getReviewsByProduct,
    getFeaturedReviews,
} = require("../controllers/reviewController");

// Tạo review
router.post(
    "/",
    authMiddleware,
    createReview
);

// Lấy review theo product
router.get(
    "/product/:productId",
    getReviewsByProduct
);

// Lấy đánh giá nổi bật cho trang chủ
router.get("/featured", getFeaturedReviews);

module.exports = router;