const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        shippingAddress: {
            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            address: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },


        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        voucherCode: {
            type: String,
            default: null,
            trim: true
        },

        userVoucher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserVoucher",
            default: null
        },


        paymentMethod: {
            type: String,
            enum: ["cod", "banking", "momo", "vnpay"],
            default: "cod"
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "pending", "paid", "failed"],
            default: "unpaid"
        },

        pointsAwarded: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipping",
                "completed",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);