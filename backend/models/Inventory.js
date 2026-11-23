const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
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

inventorySchema.index(
    { warehouse: 1, product: 1 },
    { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);