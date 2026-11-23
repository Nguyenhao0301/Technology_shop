const express = require("express");

const router = express.Router();

const {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
} = require("../controllers/warehouseController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");


// POST - Tạo Warehouse
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("warehouse.create"),
    createWarehouse
);


// GET - Lấy tất cả Warehouse
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("warehouse.read"),
    getWarehouses
);


// GET - Lấy Warehouse theo ID
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("warehouse.read"),
    getWarehouseById
);


// PUT - Cập nhật Warehouse
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("warehouse.update"),
    updateWarehouse
);


// DELETE - Vô hiệu hóa Warehouse
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("warehouse.delete"),
    deleteWarehouse
);


module.exports = router;