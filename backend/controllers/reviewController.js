const mongoose = require("mongoose");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

// CREATE REVIEW
const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        const userId = req.user.userId;

        // 1. Kiểm tra productId
        if (!productId) {
            return res.status(400).json({
                status: "error",
                message: "Product ID is required"
            });
        }

        // 2. Kiểm tra ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid product ID"
            });
        }

        // 3. Kiểm tra rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: "error",
                message: "Rating must be between 1 and 5"
            });
        }

        // 4. Kiểm tra comment
        if (!comment || !comment.trim()) {
            return res.status(400).json({
                status: "error",
                message: "Comment is required"
            });
        }

        // 5. Kiểm tra product tồn tại
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Product not found"
            });
        }

        // 6. Kiểm tra user đã review product chưa
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({
                status: "error",
                message: "You have already reviewed this product"
            });
        }

        // 7. Kiểm tra user có order completed chứa product này không
        const completedOrders = await Order.find({
            user: userId,
            status: "completed"
        }).select("_id");

        const orderIds = completedOrders.map(order => order._id);

        const purchasedItem = await OrderItem.findOne({
            order: { $in: orderIds },
            product: productId
        });

        if (!purchasedItem) {
            return res.status(403).json({
                status: "error",
                message: "You can only review products from completed orders"
            });
        }

        // 8. Tạo review
        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment: comment.trim()
        });

        // 9. Populate thông tin user
        await review.populate(
            "user",
            "name avatar"
        );

        return res.status(201).json({
            status: "success",
            message: "Review created successfully",
            data: review
        });

    } catch (error) {
        console.error("Create review error:", error);

        // Trường hợp unique index bị trùng
        if (error.code === 11000) {
            return res.status(400).json({
                status: "error",
                message: "You have already reviewed this product"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to create review"
        });
    }
};


// GET REVIEWS BY PRODUCT
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Kiểm tra ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid product ID"
            });
        }

        // 2. Kiểm tra product
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Product not found"
            });
        }

        // 3. Lấy review
        const reviews = await Review.find({
            product: productId
        })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: "success",
            data: {
                reviews,
                total: reviews.length
            }
        });

    } catch (error) {
        console.error("Get reviews error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to get reviews"
        });
    }
};

const getFeaturedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            rating: { $gte: 4 }
        })
            .populate("user", "name avatar")
            .populate("product", "name image price discountPrice")
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            status: "success",
            data: reviews
        });
    } catch (error) {
        console.error("Get featured reviews error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to get featured reviews"
        });
    }
};


module.exports = {
    createReview,
    getReviewsByProduct,
    getFeaturedReviews
};