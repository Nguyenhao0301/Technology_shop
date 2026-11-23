const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        phone: {
            type: String,
            trim: true
        },

        avatar: {
            type: String,
            default: null
        },

        role: {
            type: String,
            enum: ["customer", "staff", "admin"],
            default: "customer"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        loyaltyPoints: {
            type: Number,
            default: 0,
            min: 0
        },

        membershipTier: {
            type: String,
            enum: ["bronze", "silver", "gold", "diamond"],
            default: "bronze"
        },

        tierSpending: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);