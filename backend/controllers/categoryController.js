const Category = require("../models/Category");

//Tạo sản phẩm theo dan mục
const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        const category = await Category.create({
            name,
            description,
            image
        });

        res.status(201).json({
            message: "Category created succesfully!",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message
        });
    }
}

//Tìm kiếm sản phẩm theo danh mục
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });

        res.status(200).json({
            message: "Get categories succesfully!",
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get categories",
            error: error.mesage
        });
    }
}

//Tìm theo id của danh mục
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Get category successfully!",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get category!",
            error: error.message
        });
    }
}

//Cập nhật Category
const updateCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        const category = await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            image
        },
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category updated successfully!",
            data: category
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update",
            error: error.message
        });
    }
}

//DELETE - Soft delete Category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, {
            isActive: false
        },
            {
                new: true
            }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found!"
            });
        }

        res.status(200).json({
            message: "Category deleted successfully!",
            data: category
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}
module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };