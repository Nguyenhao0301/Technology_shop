const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(//Mô tả cấu trúc dữ liệu của danh mục category
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        image: {
            type: String
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

module.exports = mongoose.model("Category", categorySchema);