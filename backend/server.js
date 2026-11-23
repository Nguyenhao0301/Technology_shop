require("dotenv").config();//đọc các biến .env và đưa vào process.env như PORT=3000 thì process.env.PORT => 3000

const express = require("express");
const path = require("path");
const connectDB = require("./config/database");
const cors = require("cors");

const app = express();//tạo đối tượng app tượng chưng cho server Express.js

const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const rolePermissionRoutes = require("./routes/rolePermissionRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const inventoryTransactionRoutes = require("./routes/inventoryTransactionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const voucherRoutes = require("./routes/voucherRoutes");

const PORT = process.env.PORT || 3000;
//middleware
app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/transactions", inventoryTransactionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/vouchers", voucherRoutes);

//Connect MongoDB
connectDB();

//Test API
app.get("/", (req, res) => {
    res.json({
        message: "Technology Gaming Shop APi is running!"
    });
});

//Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});