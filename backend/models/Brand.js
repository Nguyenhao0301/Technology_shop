const mongoose = require("mongoose");

//Cấu trúc dữ liệu của brand
const brandSchema = new mongoose.Schema(
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

        logo: {
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
)

module.exports = mongoose.model("Brand", brandSchema);