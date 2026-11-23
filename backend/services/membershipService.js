const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

const getTierBySpending = (spending) => {
    if (spending >= 40000000) return "diamond";
    if (spending >= 15000000) return "gold";
    if (spending >= 5000000) return "silver";
    return "bronze";
};

const updateMembershipTier = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const result = await Order.aggregate([
        {
            $match: {
                user: objectUserId,
                status: "completed",
                paymentStatus: "paid",
                createdAt: { $gte: twelveMonthsAgo }
            }
        },
        {
            $group: {
                _id: "$user",
                totalSpending: { $sum: "$totalAmount" }
            }
        }
    ]);

    const tierSpending = result[0]?.totalSpending ?? 0;
    const membershipTier = getTierBySpending(tierSpending);

    await User.findByIdAndUpdate(userId, {
        tierSpending,
        membershipTier
    });

    return { tierSpending, membershipTier };
};

const awardOrderPoints = async (orderId, session) => {
    const order = await Order.findOne({
        _id: orderId,
        status: "completed",
        paymentStatus: "paid",
        pointsAwarded: false
    }).session(session);

    if (!order) {
        return {
            awarded: false,
            points: 0,
            message: "Order is not eligible or points were already awarded."
        };
    }

    const points = Math.floor(order.totalAmount / 10000);

    // Đánh dấu đơn đã cộng điểm bằng cập nhật có điều kiện.
    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            status: "completed",
            paymentStatus: "paid",
            pointsAwarded: false
        },
        {
            $set: { pointsAwarded: true }
        },
        {
            new: true,
            session
        }
    );

    if (!updatedOrder) {
        return {
            awarded: false,
            points: 0,
            message: "Order points were already processed."
        };
    }

    if (points > 0) {
        const updatedUser = await User.findByIdAndUpdate(
            order.user,
            {
                $inc: { loyaltyPoints: points }
            },
            {
                new: true,
                session
            }
        );

        if (!updatedUser) {
            throw new Error("User not found when awarding points.");
        }
    }

    return {
        awarded: true,
        points,
        message: "Order points processed successfully."
    };
};

module.exports = {
    getTierBySpending,
    updateMembershipTier,
    awardOrderPoints
};