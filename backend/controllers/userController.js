const mongoose = require("mongoose");
const User = require("../models/User");

// GET - Lấy danh sách User
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get users successfully!",
            data: users
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};

// GET - Lấy User theo ID
const getUserById = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Get user successfully!",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get user",
            error: error.message
        });
    }
};

// UPDATE - Cập nhật User
const updateUser = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const {
            name,
            email,
            phone,
            avatar,
            role,
            isActive
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                phone,
                avatar,
                role,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully!",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};

// DELETE - Soft delete User
const deleteUser = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng MongoDB ObjectId không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully!",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };