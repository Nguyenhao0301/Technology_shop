const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {register, login, getProfile, updateProfile, testAdmin } = require("../controllers/authController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/test-admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.status(200).json({
        message: "Admin access granted!"
    });
});
module.exports = router;