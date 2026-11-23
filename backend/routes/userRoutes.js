const express = require("express");

const router = express.Router();

const { getUsers, updateUser, getUserById, deleteUser} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// GET - Lấy danh sách User
router.get("/",authMiddleware,roleMiddleware("admin"),getUsers);
// UPDATE - Cập nhật User
router.put("/:id",authMiddleware,roleMiddleware("admin"),updateUser);
router.get("/:id",authMiddleware,roleMiddleware("admin"),getUserById);
// DELETE - Vô hiệu hóa User
router.delete("/:id",authMiddleware,roleMiddleware("admin"),deleteUser);
module.exports = router;