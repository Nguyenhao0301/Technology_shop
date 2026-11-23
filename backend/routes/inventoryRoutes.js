const express = require("express");

const router = express.Router();

const {
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory
} = require("../controllers/inventoryController");

const authMiddleware = require("../middleware/authMiddleware");

const permissionMiddleware = require("../middleware/permissionMiddleware");


// GET - Lấy tất cả Inventory
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("inventory.read"),
    getInventories
);


// GET - Lấy Inventory theo ID
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("inventory.read"),
    getInventoryById
);


// POST - Tạo Inventory
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("inventory.create"),
    createInventory
);

// PUT - Cập nhật Inventory

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("inventory.update"),
    updateInventory
);


// DELETE - Vô hiệu hóa Inventory

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("inventory.delete"),
    deleteInventory
);


module.exports = router;