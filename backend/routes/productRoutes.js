const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getTopSellingProducts,
    getProductById,
    getRelatedProducts,
    updateProduct,
    deleteProduct,
    getFlashDeals
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const upload = require("../middleware/uploadMiddleware");

// CREATE Product
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("product.create"),
    upload.single("image"),
    createProduct
);

// GET Products
router.get(
    "/",
    getProducts
);
//Best Seller
router.get(
    "/top-selling",
    getTopSellingProducts
);
//Get Flash Dealss
router.get(
    "/flash-deals",
    getFlashDeals
);

// GET Related Products
router.get("/:id/related", getRelatedProducts);

// GET Product By ID
router.get(
    "/:id",
    getProductById
);

// UPDATE Product
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("product.update"),
    upload.single("image"),
    updateProduct
);

// DELETE Product
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("product.delete"),
    deleteProduct
);


module.exports = router;