const RolePermission = require("../models/RolePermission");
const Permission = require("../models/Permission");

const permissionMiddleware = (permissionName) => {
    return async (req, res, next) => {
        try {
            // Kiểm tra authMiddleware đã chạy chưa
            if (!req.user) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }

            // Tìm Permission theo tên
            const permission = await Permission.findOne({
                name: permissionName,
                isActive: true
            });

            if (!permission) {
                return res.status(404).json({
                    message: "Permission not found"
                });
            }

            // Kiểm tra Role có Permission này không
            const rolePermission = await RolePermission.findOne({
                role: req.user.role,
                permission: permission._id
            });

            if (!rolePermission) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                message: "Permission check failed",
                error: error.message
            });
        }
    };
};

module.exports = permissionMiddleware;