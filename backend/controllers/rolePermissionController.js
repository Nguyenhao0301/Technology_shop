const mongoose = require("mongoose");
const RolePermission = require("../models/RolePermission");
const Permission = require("../models/Permission");

// CREATE - Gán Permission cho Role
const createRolePermission = async (req, res) => {
    try {
        const {
            role,
            permission
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!role || !permission) {
            return res.status(400).json({
                message: "Role and permission are required"
            });
        }

        // Kiểm tra Role hợp lệ
        if (!["admin", "staff", "customer"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Kiểm tra Permission ID
        if (!mongoose.Types.ObjectId.isValid(permission)) {
            return res.status(400).json({
                message: "Invalid permission ID"
            });
        }

        // Kiểm tra Permission có tồn tại không
        const existingPermission = await Permission.findById(permission);

        if (!existingPermission) {
            return res.status(404).json({
                message: "Permission not found"
            });
        }

        // Không cho gán Permission đã bị soft delete
        if (!existingPermission.isActive) {
            return res.status(400).json({
                message: "Permission is inactive"
            });
        }

        // Kiểm tra Role đã có Permission này chưa
        const existingRolePermission = await RolePermission.findOne({
            role,
            permission
        });

        if (existingRolePermission) {
            return res.status(409).json({
                message: "Permission already assigned to this role"
            });
        }

        // Tạo RolePermission
        const rolePermission = await RolePermission.create({
            role,
            permission
        });

        // Lấy thông tin Permission thay vì chỉ trả ObjectId
        const result = await RolePermission.findById(
            rolePermission._id
        ).populate("permission");

        res.status(201).json({
            message: "Permission assigned to role successfully!",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to assign permission to role",
            error: error.message
        });
    }
};

const getRolePermissions = async (req, res) => {
    try {
        const rolePermissions = await RolePermission.find()
            .populate("permission")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get role permissions successfully!",
            data: rolePermissions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get role permissions",
            error: error.message
        });
    }
};

const getPermissionsByRole = async (req, res) => {
    try {
        const { role } = req.params;

        // Kiểm tra role
        if (!["admin", "staff", "customer"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const rolePermissions = await RolePermission.find({ role })
            .populate("permission")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get permissions by role successfully!",
            data: rolePermissions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get permissions by role",
            error: error.message
        });
    }
};

module.exports = {
    createRolePermission,
    getRolePermissions,
    getPermissionsByRole
};