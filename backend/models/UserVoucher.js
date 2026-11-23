const mongoose = require("mongoose");

const userVoucherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        voucher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            required: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        pointsSpent: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["available", "used", "expired"],
            default: "available"
        },

        redeemedAt: {
            type: Date,
            default: Date.now
        },

        expiresAt: {
            type: Date,
            required: true
        },

        usedAt: {
            type: Date,
            default: null
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null
        }
    },
    {
        timestamps: true
    }
);

userVoucherSchema.index({ user: 1, status: 1 });
userVoucherSchema.index({ user: 1, voucher: 1 });

module.exports = mongoose.model("UserVoucher", userVoucherSchema);