const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["import", "export", "transfer"],
            required: true
        },

        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            default: null
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        fromWarehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            default: null
        },

        toWarehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            default: null
        },

        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);