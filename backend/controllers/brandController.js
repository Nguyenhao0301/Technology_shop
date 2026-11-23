const Brand = require("../models/Brand");
const mongoose = require("mongoose")

//POST - Tạo Brand
const createBrand = async (req, res) => {
    try {
        const { name, description, logo } = req.body;

        const brand = await Brand.create({
            name,
            description,
            logo
        });

        res.status(201).json({
            message: "Brand created successfully!",
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create brand",
            error: error.message
        });
    }
}

// GET - Lấy tất cả Brands đang hoạt động
const getBrand = async (req, res) => {
    try {

        const brands = await Brand.find({
            isActive: true
        });

        res.status(200).json({
            message: "Get brands successfully!",
            data: brands
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get brands",
            error: error.message
        });

    }
};


//GET - Lấy Brand theo ID
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found!"
            });
        }

        res.status(200).json({
            message: "Get brand successfully!",
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get Brand",
            error: error.message
        });
    }
}

//PUT - Cập nhập Brand
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, description, logo, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: "Invalid Brand ID!"
            });
        }

        const brand = await Brand.findByIdAndUpdate(
            id,
            {
                name,
                description,
                logo,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        res.status(200).json({
            message: "Brand updated successfully!",
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update brand",
            error: error.message
        });
    }
};

//Delete - Soft Delete
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: "Invalid brand ID"
            });
        }

        const brand = await Brand.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found!"
            });
        }

        res.status(200).json({
            message: "Brand deleted successfully!",
            data: brand
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete brand",
            error: error.message
        })
    }
}
module.exports = { createBrand, getBrand, getBrandById, updateBrand, deleteBrand };