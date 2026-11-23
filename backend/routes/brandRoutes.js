const express = require("express");

const router = express.Router();

const {
    createBrand,
    getBrand,
    getBrandById,
    updateBrand,
    deleteBrand
} = require("../controllers/brandController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");


// POST - Tạo Brand
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("brand.create"),
    createBrand
);


// GET - Lấy tất cả Brand
router.get(
    "/",
    getBrand
);


// GET - Lấy Brand theo ID
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("brand.read"),
    getBrandById
);


// PUT - Cập nhật Brand
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("brand.update"),
    updateBrand
);


// DELETE - Xóa Brand
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("brand.delete"),
    deleteBrand
);


module.exports = router;