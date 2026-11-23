const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// CREATE Category
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("category.create"),
    createCategory
);

// GET Categories
router.get(
    "/",
    getCategories
);

// GET Category By ID
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("category.read"),
    getCategoryById
);

// UPDATE Category
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("category.update"),
    updateCategory
);

// DELETE Category
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("category.delete"),
    deleteCategory
);

module.exports = router;