const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER - Đăng ký tài khoản
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone
        } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        // Kiểm tra dữ liệu bắt buộc
        if (!name?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo User
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone
        });

        // Không trả password về client
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            loyaltyPoints: user.loyaltyPoints,
            membershipTier: user.membershipTier,
            tierSpending: user.tierSpending,
        };

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(201).json({
            message: "User registered successfully!",
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register user",
            error: error.message
        });
    }
};

// LOGIN - Đăng nhập
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        // Kiểm tra dữ liệu bắt buộc
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Tìm User theo email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Kiểm tra tài khoản có đang hoạt động không
        if (!user.isActive) {
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        // So sánh password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Tạo JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Không trả password
        res.status(200).json({
            message: "Login successful!",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                    isActive: user.isActive,
                    loyaltyPoints: user.loyaltyPoints,
                    membershipTier: user.membershipTier,
                    tierSpending: user.tierSpending,
                },
                token
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to login",
            error: error.message
        });
    }
};

// GET - Lấy thông tin User hiện tại
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Get profile successfully!",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};

// PUT - Cập nhật hồ sơ cá nhân
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        // Kiểm tra họ tên
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        // Kiểm tra số điện thoại
        if (phone !== undefined && typeof phone !== "string") {
            return res.status(400).json({
                message: "Phone must be a string"
            });
        }

        // Chỉ cập nhật họ tên và số điện thoại
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                name: name.trim(),
                ...(phone !== undefined
                    ? { phone: phone.trim() }
                    : {})
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully!",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

const testAdmin = (req, res) => {
    res.status(200).json({
        message: "Admin access granted!",
        user: req.user
    });
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    testAdmin
};