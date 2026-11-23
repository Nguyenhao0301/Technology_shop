const mongoose = require("mongoose");
const Permission = require("../models/Permission");

// CREATE - Tạo Permission
const createPermission = async (req, res) => {
    try {
        const {
            name,
            description
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!name) {
            return res.status(400).json({
                message: "Permission name is required"
            });
        }

        // Kiểm tra Permission đã tồn tại
        const existingPermission = await Permission.findOne({ name });

        if (existingPermission) {
            return res.status(409).json({
                message: "Permission already exists"
            });
        }

        const permission = await Permission.create({
            name,
            description
        });

        res.status(201).json({
            message: "Permission created successfully!",
            data: permission
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create permission",
            error: error.message
        });
    }
};


// GET - Lấy danh sách Permission
const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get permissions successfully!",
            data: permissions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get permissions",
            error: error.message
        });
    }
};


// GET - Lấy Permission theo ID
const getPermissionById = async (req, res) => {
    try {

        // Kiểm tra ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid permission ID"
            });
        }

        const permission = await Permission.findById(req.params.id);

        if (!permission) {
            return res.status(404).json({
                message: "Permission not found"
            });
        }

        res.status(200).json({
            message: "Get permission successfully!",
            data: permission
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get permission",
            error: error.message
        });
    }
};


// UPDATE - Cập nhật Permission
const updatePermission = async (req, res) => {
    try {

        // Kiểm tra ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid permission ID"
            });
        }

        const {
            name,
            description,
            isActive
        } = req.body;

        const permission = await Permission.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!permission) {
            return res.status(404).json({
                message: "Permission not found"
            });
        }

        res.status(200).json({
            message: "Permission updated successfully!",
            data: permission
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update permission",
            error: error.message
        });
    }
};

// DELETE - Soft delete Permission
const deletePermission = async (req, res) => {
    try {

        // Kiểm tra ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid permission ID"
            });
        }

        const permission = await Permission.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!permission) {
            return res.status(404).json({
                message: "Permission not found"
            });
        }

        res.status(200).json({
            message: "Permission deleted successfully!",
            data: permission
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete permission",
            error: error.message
        });
    }
};

module.exports = {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
};