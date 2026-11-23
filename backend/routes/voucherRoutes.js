
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
    createVoucher,
    getVouchers,
    updateVoucher,
    deleteVoucher,
    getRedeemableVouchers,
    redeemVoucher,
    getMyVouchers
} = require("../controllers/voucherController");

// Khách hàng: xem voucher có thể đổi
router.get(
    "/redeemable",
    authMiddleware,
    getRedeemableVouchers
);

// Khách hàng: đổi voucher bằng điểm tích lũy
router.post(
    "/:id/redeem",
    authMiddleware,
    redeemVoucher
);

// Khách hàng: xem voucher đã đổi
router.get(
    "/my-vouchers",
    authMiddleware,
    getMyVouchers
);

// Lấy danh sách voucher
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("voucher.read"),
    getVouchers
);

// Tạo voucher
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("voucher.create"),
    createVoucher
);

// Cập nhật voucher
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("voucher.update"),
    updateVoucher
);

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("voucher.delete"),
    deleteVoucher
);

module.exports = router;
