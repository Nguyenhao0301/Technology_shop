const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    simulatePayment,
    confirmCODPayment
} = require("../controllers/orderController");


router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.get("/", authMiddleware, permissionMiddleware("order.read"), getAllOrders);
router.put("/:id/status", authMiddleware, permissionMiddleware("order.update"), updateOrderStatus);
router.post("/:id/simulate-payment", authMiddleware, simulatePayment);
router.put(
    "/:id/confirm-cod-payment",
    authMiddleware,
    permissionMiddleware("order.update"),
    confirmCODPayment
);
module.exports = router;