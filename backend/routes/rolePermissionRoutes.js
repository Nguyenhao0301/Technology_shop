const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const {
    createRolePermission,
    getRolePermissions,
    getPermissionsByRole
} = require("../controllers/rolePermissionController");
const permissionMiddleware = require("../middleware/permissionMiddleware");

router.post("/", createRolePermission);

router.get("/", getRolePermissions);

router.get("/role/:role", getPermissionsByRole);

router.get(
    "/test-product-read",
    authMiddleware,
    permissionMiddleware("product.read"),
    (req, res) => {
        res.status(200).json({
            message: "Product read permission granted!"
        });
    }
);

module.exports = router;