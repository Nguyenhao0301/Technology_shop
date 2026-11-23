const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getMembership } = require("../controllers/membershipController");

router.get("/", authMiddleware, getMembership);

module.exports = router;
