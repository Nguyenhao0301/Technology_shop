const User = require("../models/User");

// GET - Lấy thông tin thành viên của tài khoản hiện tại
const getMembership = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("name email loyaltyPoints membershipTier tierSpending");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Get membership successfully!",
            data: {
                name: user.name,
                email: user.email,
                loyaltyPoints: user.loyaltyPoints ?? 0,
                membershipTier: user.membershipTier ?? "bronze",
                tierSpending: user.tierSpending ?? 0
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get membership",
            error: error.message
        });
    }
};

module.exports = { getMembership };