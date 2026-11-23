const express = require("express");

const router = express.Router();

const {
    getTransactions,
    getTransactionById,
    createTransaction
} = require("../controllers/inventoryTransactionController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");


// GET - Lấy tất cả Transaction
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("transaction.read"),
    getTransactions
);


// GET - Lấy Transaction theo ID
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("transaction.read"),
    getTransactionById
);

// POST - Tạo Transaction
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("transaction.create"),
    createTransaction
);


module.exports = router;