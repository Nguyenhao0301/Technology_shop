const Voucher = require("../models/Voucher");
const UserVoucher = require("../models/UserVoucher");
const mongoose = require("mongoose");
const User = require("../models/User");

// CREATE - Tạo chương trình voucher
const createVoucher = async (req, res) => {
    try {
        const {
            name,
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            minOrderAmount,
            pointsRequired,
            totalQuantity,
            startAt,
            endAt
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (
            !name ||
            !discountType ||
            discountValue === undefined ||
            pointsRequired === undefined ||
            totalQuantity === undefined ||
            !startAt ||
            !endAt
        ) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Kiểm tra loại giảm giá
        if (!["fixed", "percentage"].includes(discountType)) {
            return res.status(400).json({
                message: "Invalid discount type"
            });
        }

        // Kiểm tra giá trị giảm giá
        if (
            !Number.isFinite(Number(discountValue)) ||
            Number(discountValue) <= 0
        ) {
            return res.status(400).json({
                message: "Discount value must be greater than 0"
            });
        }

        if (
            discountType === "percentage" &&
            Number(discountValue) > 100
        ) {
            return res.status(400).json({
                message: "Percentage discount cannot exceed 100"
            });
        }

        // Kiểm tra điểm cần đổi
        if (
            !Number.isInteger(Number(pointsRequired)) ||
            Number(pointsRequired) < 1
        ) {
            return res.status(400).json({
                message: "Points required must be a positive integer"
            });
        }

        // Kiểm tra số lượng voucher
        if (
            !Number.isInteger(Number(totalQuantity)) ||
            Number(totalQuantity) < 1
        ) {
            return res.status(400).json({
                message: "Total quantity must be a positive integer"
            });
        }

        // Kiểm tra số tiền tối thiểu của đơn hàng
        if (
            minOrderAmount !== undefined &&
            (
                !Number.isFinite(Number(minOrderAmount)) ||
                Number(minOrderAmount) < 0
            )
        ) {
            return res.status(400).json({
                message: "Minimum order amount cannot be negative"
            });
        }

        // Kiểm tra mức giảm tối đa
        if (
            maxDiscountAmount !== undefined &&
            maxDiscountAmount !== null &&
            (
                !Number.isFinite(Number(maxDiscountAmount)) ||
                Number(maxDiscountAmount) < 0
            )
        ) {
            return res.status(400).json({
                message: "Maximum discount amount cannot be negative"
            });
        }

        // Kiểm tra ngày hiệu lực
        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            endDate <= startDate
        ) {
            return res.status(400).json({
                message: "End date must be later than start date"
            });
        }

        // Tạo chương trình voucher
        const voucher = await Voucher.create({
            name: name.trim(),
            description,
            discountType,
            discountValue: Number(discountValue),
            maxDiscountAmount:
                maxDiscountAmount === undefined ||
                    maxDiscountAmount === null ||
                    maxDiscountAmount === ""
                    ? null
                    : Number(maxDiscountAmount),
            minOrderAmount:
                minOrderAmount === undefined || minOrderAmount === ""
                    ? 0
                    : Number(minOrderAmount),
            pointsRequired: Number(pointsRequired),
            totalQuantity: Number(totalQuantity),
            remainingQuantity: Number(totalQuantity),
            startAt: startDate,
            endAt: endDate
        });

        return res.status(201).json({
            message: "Voucher created successfully!",
            data: voucher
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid voucher data",
                error: error.message
            });
        }

        console.error("Create voucher error:", error);

        return res.status(500).json({
            message: "Failed to create voucher",
            error: error.message
        });
    }
};

const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Get vouchers successfully!",
            data: vouchers
        });
    } catch (error) {
        console.error("Get vouchers error:", error);

        return res.status(500).json({
            message: "Failed to get vouchers",
            error: error.message
        });
    }
};


const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            minOrderAmount,
            pointsRequired,
            totalQuantity,
            startAt,
            endAt,
            isActive
        } = req.body;

        const voucher = await Voucher.findById(id);

        if (!voucher) {
            return res.status(404).json({
                message: "Voucher not found"
            });
        }

        // Chỉ cập nhật các trường được gửi lên
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Voucher name cannot be empty"
                });
            }
            voucher.name = name.trim();
        }

        if (description !== undefined) {
            voucher.description = description;
        }

        if (discountType !== undefined) {
            if (!["fixed", "percentage"].includes(discountType)) {
                return res.status(400).json({
                    message: "Invalid discount type"
                });
            }
            voucher.discountType = discountType;
        }

        if (discountValue !== undefined) {
            if (
                !Number.isFinite(Number(discountValue)) ||
                Number(discountValue) <= 0
            ) {
                return res.status(400).json({
                    message: "Discount value must be greater than 0"
                });
            }
            voucher.discountValue = Number(discountValue);
        }

        if (
            voucher.discountType === "percentage" &&
            voucher.discountValue > 100
        ) {
            return res.status(400).json({
                message: "Percentage discount cannot exceed 100"
            });
        }

        if (maxDiscountAmount !== undefined) {
            if (
                maxDiscountAmount !== null &&
                maxDiscountAmount !== "" &&
                (
                    !Number.isFinite(Number(maxDiscountAmount)) ||
                    Number(maxDiscountAmount) < 0
                )
            ) {
                return res.status(400).json({
                    message: "Maximum discount amount cannot be negative"
                });
            }

            voucher.maxDiscountAmount =
                maxDiscountAmount === null || maxDiscountAmount === ""
                    ? null
                    : Number(maxDiscountAmount);
        }

        if (minOrderAmount !== undefined) {
            if (
                !Number.isFinite(Number(minOrderAmount)) ||
                Number(minOrderAmount) < 0
            ) {
                return res.status(400).json({
                    message: "Minimum order amount cannot be negative"
                });
            }
            voucher.minOrderAmount = Number(minOrderAmount);
        }

        if (pointsRequired !== undefined) {
            if (
                !Number.isInteger(Number(pointsRequired)) ||
                Number(pointsRequired) < 1
            ) {
                return res.status(400).json({
                    message: "Points required must be a positive integer"
                });
            }
            voucher.pointsRequired = Number(pointsRequired);
        }

        if (totalQuantity !== undefined) {
            if (
                !Number.isInteger(Number(totalQuantity)) ||
                Number(totalQuantity) < 1
            ) {
                return res.status(400).json({
                    message: "Total quantity must be a positive integer"
                });
            }

            const soldOrRedeemed =
                voucher.totalQuantity - voucher.remainingQuantity;

            if (Number(totalQuantity) < soldOrRedeemed) {
                return res.status(400).json({
                    message: "Total quantity cannot be less than quantities already used or redeemed"
                });
            }

            voucher.totalQuantity = Number(totalQuantity);
            voucher.remainingQuantity =
                Number(totalQuantity) - soldOrRedeemed;
        }

        if (startAt !== undefined) {
            voucher.startAt = new Date(startAt);
        }

        if (endAt !== undefined) {
            voucher.endAt = new Date(endAt);
        }

        if (
            Number.isNaN(voucher.startAt.getTime()) ||
            Number.isNaN(voucher.endAt.getTime()) ||
            voucher.endAt <= voucher.startAt
        ) {
            return res.status(400).json({
                message: "End date must be later than start date"
            });
        }

        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive must be a boolean"
                });
            }
            voucher.isActive = isActive;
        }

        await voucher.save();

        return res.status(200).json({
            message: "Voucher updated successfully!",
            data: voucher
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid voucher data",
                error: error.message
            });
        }

        console.error("Update voucher error:", error);

        return res.status(500).json({
            message: "Failed to update voucher",
            error: error.message
        });
    }
};

// DELETE - Xóa voucher chưa có khách đổi
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID MongoDB hợp lệ
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid voucher ID"
            });
        }

        // Kiểm tra voucher có tồn tại không
        const voucher = await Voucher.findById(id);

        if (!voucher) {
            return res.status(404).json({
                message: "Voucher not found"
            });
        }

        // Kiểm tra lịch sử khách hàng đổi voucher
        const hasRedemption = await UserVoucher.exists({
            voucher: voucher._id
        });

        if (hasRedemption) {
            return res.status(409).json({
                message:
                    "Cannot delete this voucher because customers have redeemed it. Please deactivate it instead."
            });
        }

        await Voucher.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Voucher deleted successfully!"
        });
    } catch (error) {
        console.error("Delete voucher error:", error);

        return res.status(500).json({
            message: "Failed to delete voucher",
            error: error.message
        });
    }
};

const getRedeemableVouchers = async (req, res) => {
    try {
        const now = new Date();

        const vouchers = await Voucher.find({
            isActive: true,
            remainingQuantity: { $gt: 0 },
            startAt: { $lte: now },
            endAt: { $gt: now },
        })
            .sort({ pointsRequired: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Get redeemable vouchers successfully!",
            data: vouchers,
        });
    } catch (error) {
        console.error("Get redeemable vouchers error:", error);

        return res.status(500).json({
            message: "Failed to get redeemable vouchers",
            error: error.message,
        });
    }
};

// REDEEM - Khách hàng đổi voucher bằng điểm tích lũy
const redeemVoucher = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid voucher ID"
            });
        }

        let redeemedVoucher = null;

        await session.withTransaction(async () => {
            const now = new Date();

            // Kiểm tra khách hàng
            const user = await User.findById(userId).session(session);

            if (!user || !user.isActive) {
                throw Object.assign(
                    new Error("User not found or inactive"),
                    { statusCode: 403 }
                );
            }

            // Kiểm tra voucher còn hiệu lực và còn số lượng
            const voucher = await Voucher.findOne({
                _id: id,
                isActive: true,
                remainingQuantity: { $gt: 0 },
                startAt: { $lte: now },
                endAt: { $gt: now }
            }).session(session);

            if (!voucher) {
                throw Object.assign(
                    new Error("Voucher is unavailable or expired"),
                    { statusCode: 404 }
                );
            }

            // Kiểm tra điểm tích lũy
            if (user.loyaltyPoints < voucher.pointsRequired) {
                throw Object.assign(
                    new Error("Not enough loyalty points"),
                    { statusCode: 400 }
                );
            }

            // Trừ điểm có điều kiện để tránh trừ quá số điểm hiện có
            const updatedUser = await User.findOneAndUpdate(
                {
                    _id: user._id,
                    loyaltyPoints: { $gte: voucher.pointsRequired },
                    isActive: true
                },
                {
                    $inc: {
                        loyaltyPoints: -voucher.pointsRequired
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!updatedUser) {
                throw Object.assign(
                    new Error("Not enough loyalty points"),
                    { statusCode: 400 }
                );
            }

            // Giảm số lượng nếu voucher vẫn còn và vẫn hợp lệ
            const updatedVoucher = await Voucher.findOneAndUpdate(
                {
                    _id: voucher._id,
                    isActive: true,
                    remainingQuantity: { $gt: 0 },
                    startAt: { $lte: now },
                    endAt: { $gt: now }
                },
                {
                    $inc: { remainingQuantity: -1 }
                },
                {
                    new: true,
                    session
                }
            );

            if (!updatedVoucher) {
                throw Object.assign(
                    new Error("Voucher is no longer available"),
                    { statusCode: 409 }
                );
            }

            // Tạo mã riêng cho khách hàng
            const code =
                `UV-${new mongoose.Types.ObjectId().toString().slice(-8)}`
                    .toUpperCase();

            const [userVoucher] = await UserVoucher.create(
                [{
                    user: user._id,
                    voucher: voucher._id,
                    code,
                    pointsSpent: voucher.pointsRequired,
                    status: "available",
                    redeemedAt: now,
                    expiresAt: voucher.endAt
                }],
                { session }
            );

            redeemedVoucher = {
                userVoucher,
                remainingPoints: updatedUser.loyaltyPoints,
                remainingQuantity: updatedVoucher.remainingQuantity
            };
        });

        return res.status(201).json({
            message: "Voucher redeemed successfully!",
            data: redeemedVoucher
        });
    } catch (error) {
        console.error("Redeem voucher error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.message || "Failed to redeem voucher"
        });
    } finally {
        await session.endSession();
    }
};

// GET - Lấy danh sách voucher khách hàng đã đổi
const getMyVouchers = async (req, res) => {
    try {
        const userId = req.user.userId;

        const userVouchers = await UserVoucher.find({
            user: userId
        })
            .populate({
                path: "voucher",
                select: "name description discountType discountValue maxDiscountAmount minOrderAmount startAt endAt isActive"

            })
            .sort({ redeemedAt: -1 })
            .lean();

        const now = new Date();

        // Cập nhật trạng thái hết hạn khi khách xem danh sách
        const data = userVouchers.map((item) => {
            let status = item.status;

            if (status === "available" && new Date(item.expiresAt) <= now) {
                status = "expired";
            }

            return {
                ...item,
                status
            };
        });

        return res.status(200).json({
            message: "Get my vouchers successfully!",
            data
        });
    } catch (error) {
        console.error("Get my vouchers error:", error);

        return res.status(500).json({
            message: "Failed to get my vouchers",
            error: error.message
        });
    }
};

module.exports = {
    createVoucher,
    getVouchers,
    updateVoucher,
    deleteVoucher,
    getRedeemableVouchers,
    redeemVoucher,
    getMyVouchers
};