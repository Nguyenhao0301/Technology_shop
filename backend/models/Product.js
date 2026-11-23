const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        specifications: {
            type: Map,
            of: String,
            default: {}
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        // Thông tin Flash Deals
        discountPrice: {
            type: Number,
            min: 0,
            default: null
        },

        dealStart: {
            type: Date,
            default: null
        },

        dealEnd: {
            type: Date,
            default: null
        },

        image: {
            type: String
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand"
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Product", productSchema);