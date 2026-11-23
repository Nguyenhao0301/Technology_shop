const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["main", "branch"],
            required: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
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

module.exports = mongoose.model("Warehouse", warehouseSchema);