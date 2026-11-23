const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        discountType: {
            type: String,
            enum: ["fixed", "percentage"],
            required: true
        },

        discountValue: {
            type: Number,
            required: true,
            min: 1
        },

        maxDiscountAmount: {
            type: Number,
            default: null,
            min: 0
        },

        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        pointsRequired: {
            type: Number,
            required: true,
            min: 1
        },

        totalQuantity: {
            type: Number,
            required: true,
            min: 1
        },

        remainingQuantity: {
            type: Number,
            required: true,
            min: 0
        },

        startAt: {
            type: Date,
            required: true
        },

        endAt: {
            type: Date,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

voucherSchema.index({ isActive: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model("Voucher", voucherSchema);