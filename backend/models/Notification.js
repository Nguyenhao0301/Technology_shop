
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },

        type: {
            type: String,
            enum: [
                "promotion",
                "back_in_stock",
                "system",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        link: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
