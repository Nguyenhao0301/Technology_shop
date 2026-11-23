const express = require("express");

const router = express.Router();

const {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
} = require("../controllers/permissionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// CREATE Permission
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createPermission
);

// GET Permissions
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getPermissions
);

// GET Permission By ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getPermissionById
);

// UPDATE Permission
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updatePermission
);

// DELETE Permission
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deletePermission
);

module.exports = router;