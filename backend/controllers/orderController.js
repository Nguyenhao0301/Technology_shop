const mongoose = require("mongoose");

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const {
    awardOrderPoints,
    updateMembershipTier
} = require("../services/membershipService");
const UserVoucher = require("../models/UserVoucher");


const createOrder = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        const {
            items,
            shippingAddress,
            paymentMethod,
            voucherCode
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                message: "Cart is empty"
            });

        }

        if (
            !shippingAddress ||
            !shippingAddress.name ||
            !shippingAddress.email ||
            !shippingAddress.phone ||
            !shippingAddress.address ||
            !shippingAddress.city
        ) {

            return res.status(400).json({
                message: "Shipping information is incomplete"
            });

        }

        const selectedPaymentMethod =
            paymentMethod || "cod";

        if (
            !["cod", "banking", "momo", "vnpay"].includes(
                selectedPaymentMethod
            )
        ) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        session.startTransaction();


        const orderItems = [];

        let totalAmount = 0;
        let discountAmount = 0;
        let appliedVoucher = null;


        // Kiểm tra voucher nếu khách có nhập mã
        if (voucherCode && voucherCode.trim()) {
            const normalizedCode = voucherCode.trim().toUpperCase();

            const userVoucher = await UserVoucher.findOne({
                user: req.user.userId,
                code: normalizedCode,
                status: "available",
                expiresAt: { $gt: new Date() }
            })
                .populate("voucher")
                .session(session);

            if (!userVoucher || !userVoucher.voucher) {
                throw new Error(
                    "Voucher không tồn tại, đã sử dụng hoặc hết hạn"
                );
            }

            const voucher = userVoucher.voucher;
            const now = new Date();

            if (
                !voucher.isActive ||
                now < voucher.startAt ||
                now >= voucher.endAt
            ) {
                throw new Error(
                    "Chương trình voucher không còn hiệu lực"
                );
            }

            appliedVoucher = userVoucher;
        }

        for (const item of items) {

            if (!item.productId) {

                throw new Error(
                    "Product ID is required"
                );

            }

            if (
                !item.quantity ||
                item.quantity < 1 ||
                !Number.isInteger(item.quantity)
            ) {

                throw new Error(
                    "Invalid product quantity"
                );

            }

            const product = await Product
                .findOne({
                    _id: item.productId,
                    isActive: true
                })
                .session(session);


            if (!product) {

                throw new Error(
                    `Product not found: ${item.productId}`
                );

            }

            if (product.stock < item.quantity) {

                throw new Error(
                    `Not enough stock for ${product.name}`
                );

            }

            const subtotal =
                product.price * item.quantity;

            totalAmount += subtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: subtotal
            });

        }

        // Tính giảm giá sau khi đã tính tổng tiền sản phẩm
        if (appliedVoucher) {
            const voucher = appliedVoucher.voucher;

            if (totalAmount < voucher.minOrderAmount) {
                throw new Error(
                    `Đơn hàng phải đạt tối thiểu ${voucher.minOrderAmount.toLocaleString("vi-VN")} VND để sử dụng voucher`
                );
            }

            if (voucher.discountType === "fixed") {
                discountAmount = voucher.discountValue;
            } else if (voucher.discountType === "percentage") {
                discountAmount =
                    totalAmount * voucher.discountValue / 100;
            }

            // Áp dụng giới hạn giảm giá tối đa nếu được cấu hình
            if (voucher.maxDiscountAmount !== null &&
                voucher.maxDiscountAmount !== undefined) {
                discountAmount = Math.min(
                    discountAmount,
                    voucher.maxDiscountAmount
                );
            }

            // Không cho giảm nhiều hơn tổng tiền đơn hàng
            discountAmount = Math.min(
                discountAmount,
                totalAmount
            );

            // Làm tròn đến đơn vị đồng
            discountAmount = Math.round(discountAmount);

            // Chuyển totalAmount thành số tiền phải thanh toán
            totalAmount -= discountAmount;
        }

        const order = await Order.create(
            [
                {
                    user: req.user.userId,

                    shippingAddress: {
                        name: shippingAddress.name,
                        email: shippingAddress.email,
                        phone: shippingAddress.phone,
                        address: shippingAddress.address,
                        city: shippingAddress.city
                    },

                    totalAmount: totalAmount,
                    discountAmount: discountAmount,
                    voucherCode: appliedVoucher
                        ? appliedVoucher.code
                        : null,
                    userVoucher: appliedVoucher
                        ? appliedVoucher._id
                        : null,

                    paymentMethod: selectedPaymentMethod,

                    paymentStatus:
                        selectedPaymentMethod === "cod"
                            ? "unpaid"
                            : selectedPaymentMethod === "momo" ||
                                selectedPaymentMethod === "vnpay"
                                ? "pending"
                                : "unpaid",

                    status: "pending"
                }
            ],
            {
                session
            }
        );

        const createdOrder = order[0];

        if (appliedVoucher) {
            const updatedVoucher = await UserVoucher.findOneAndUpdate(
                {
                    _id: appliedVoucher._id,
                    user: req.user.userId,
                    status: "available",
                    expiresAt: { $gt: new Date() }
                },
                {
                    $set: {
                        status: "used",
                        usedAt: new Date(),
                        order: createdOrder._id
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!updatedVoucher) {
                throw new Error(
                    "Voucher đã được sử dụng hoặc không còn hợp lệ"
                );
            }
        }

        const orderItemsWithOrderId =
            orderItems.map(item => ({
                ...item,
                order: createdOrder._id
            }));

        await OrderItem.insertMany(
            orderItemsWithOrderId,
            {
                session
            }
        );

        for (const item of orderItems) {

            const updatedProduct =
                await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        stock: {
                            $gte: item.quantity
                        }
                    },
                    {
                        $inc: {
                            stock: -item.quantity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );

            if (!updatedProduct) {

                throw new Error(
                    `Stock changed for product ${item.name}`
                );

            }

        }

        await session.commitTransaction();

        const finalOrder =
            await Order.findById(
                createdOrder._id
            )
                .populate(
                    "user",
                    "name email phone"
                );

        const finalOrderItems =
            await OrderItem.find({
                order: createdOrder._id
            })
                .populate(
                    "product",
                    "name image price"
                );

        return res.status(201).json({
            message: "Order created successfully",
            data: {
                order: finalOrder,
                items: finalOrderItems
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error(
            "Create order error:",
            error
        );

        return res.status(400).json({
            message: error.message || "Failed to create order"
        });

    } finally {
        session.endSession();
    }
};

const getMyOrders = async (req, res) => {

    try {

        const orders = await Order.find({
            user: req.user.userId
        })
            .sort({ createdAt: -1 })
            .populate(
                "user",
                "name email phone"
            );

        const ordersWithItems = await Promise.all(

            orders.map(async (order) => {

                const items = await OrderItem.find({
                    order: order._id
                })
                    .populate(
                        "product",
                        "name image price"
                    );

                return {
                    order,
                    items
                };

            })

        );

        return res.status(200).json({

            message: "Get my orders successfully",

            data: ordersWithItems

        });

    } catch (error) {

        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get orders",
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({
            _id: id,
            user: req.user.userId
        })
            .populate(
                "user",
                "name email phone"
            );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const items = await OrderItem.find({
            order: order._id
        })
            .populate(
                "product",
                "name image price"
            );

        return res.status(200).json({
            message: "Get order successfully",
            data: {
                order,
                items
            }
        });
    } catch (error) {
        console.error(
            "Get order detail error:",
            error
        );
        return res.status(500).json({
            message: "Failed to get order",
            error: error.message
        });
    }
};

const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        session.startTransaction();
        const order = await Order.findOne({
            _id: id,
            user: req.user.userId
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.status !== "pending") {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Only pending orders can be cancelled"
            });
        }

        const orderItems = await OrderItem.find({
            order: order._id
        }).session(session);

        if (!orderItems || orderItems.length === 0) {
            throw new Error(
                "Order has no items"
            );
        }

        order.status = "cancelled";
        await order.save({
            session
        });

        for (const item of orderItems) {
            const updatedProduct =
                await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: item.quantity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );

            if (!updatedProduct) {
                throw new Error(
                    `Product not found: ${item.name}`
                );
            }
        }

        await session.commitTransaction();

        const finalOrder =
            await Order.findById(order._id)
                .populate(
                    "user",
                    "name email phone"
                );
        const finalOrderItems =
            await OrderItem.find({
                order: order._id
            })
                .populate(
                    "product",
                    "name image price"
                );
        return res.status(200).json({
            message: "Order cancelled successfully",
            data: {
                order: finalOrder,
                items: finalOrderItems
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error(
            "Cancel order error:",
            error
        );
        return res.status(400).json({
            message: error.message || "Failed to cancel order"
        });
    } finally {
        session.endSession();
    }
};

const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate(
                "user",
                "name email phone"
            );

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {

                const items = await OrderItem.find({
                    order: order._id
                })
                    .populate(
                        "product",
                        "name image price"
                    );

                return {
                    order,
                    items
                };
            })
        );

        return res.status(200).json({
            message: "Get all orders successfully",
            data: ordersWithItems
        });

    } catch (error) {

        console.error(
            "Get all orders error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get all orders",
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipping",
            "completed",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        let updatedOrder;
        let pointsResult = {
            awarded: false,
            points: 0,
            message: "No points awarded."
        };

        await session.withTransaction(async () => {
            const order = await Order.findById(id).session(session);

            if (!order) {
                const error = new Error("Order not found");
                error.statusCode = 404;
                throw error;
            }

            const currentStatus = order.status;

            const validTransitions = {
                pending: ["confirmed", "cancelled"],
                confirmed: ["shipping"],
                shipping: ["completed"],
                completed: [],
                cancelled: []
            };

            if (!validTransitions[currentStatus]?.includes(status)) {
                const error = new Error(
                    `Cannot change order status from ${currentStatus} to ${status}`
                );
                error.statusCode = 400;
                throw error;
            }

            order.status = status;
            await order.save({ session });

            if (status === "completed" && order.paymentStatus === "paid") {
                pointsResult = await awardOrderPoints(order._id, session);
            }

            updatedOrder = order;
        });

        // Tính lại hạng sau khi transaction thành công.
        let membershipResult = null;

        if (updatedOrder.status === "completed") {
            membershipResult = await updateMembershipTier(updatedOrder.user);
        }

        const items = await OrderItem.find({
            order: updatedOrder._id
        }).populate("product", "name image price");

        return res.status(200).json({
            message: "Order status updated successfully",
            data: {
                order: updatedOrder,
                items,
                points: pointsResult,
                membership: membershipResult
            }
        });
    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to update order status",
            ...(error.statusCode ? {} : { error: error.message })
        });
    } finally {
        await session.endSession();
    }
};


const simulatePayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const { result } = req.body;

        if (!["success", "failure"].includes(result)) {
            return res.status(400).json({
                message: "Kết quả thanh toán không hợp lệ"
            });
        }

        let responseData = null;

        await session.withTransaction(async () => {
            const order = await Order.findOne({
                _id: id,
                user: req.user.userId
            }).session(session);

            if (!order) {
                const error = new Error("Không tìm thấy đơn hàng");
                error.statusCode = 404;
                throw error;
            }

            if (!["momo", "vnpay"].includes(order.paymentMethod)) {
                const error = new Error(
                    "Đơn hàng không sử dụng MoMo hoặc VNPay"
                );
                error.statusCode = 400;
                throw error;
            }

            if (order.status === "cancelled") {
                const error = new Error(
                    "Không thể thanh toán đơn hàng đã bị hủy"
                );
                error.statusCode = 400;
                throw error;
            }

            if (order.paymentStatus !== "pending") {
                const error = new Error(
                    "Đơn hàng không ở trạng thái chờ thanh toán"
                );
                error.statusCode = 400;
                throw error;
            }

            order.paymentStatus =
                result === "success" ? "paid" : "failed";

            await order.save({ session });

            let pointsResult = {
                awarded: false,
                points: 0,
                message: "Đơn hàng chưa đủ điều kiện cộng điểm."
            };

            if (result === "success" && order.status === "completed") {
                pointsResult = await awardOrderPoints(order._id, session);
            }

            responseData = {
                order,
                points: pointsResult
            };
        });

        let membershipResult = null;

        if (result === "success" && responseData.order.status === "completed") {
            membershipResult = await updateMembershipTier(
                responseData.order.user
            );
        }

        return res.status(200).json({
            message: result === "success"
                ? "Thanh toán mô phỏng thành công"
                : "Thanh toán mô phỏng thất bại",
            data: {
                ...responseData,
                membership: membershipResult
            }
        });
    } catch (error) {
        console.error("Simulate payment error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Không thể xử lý thanh toán",
            ...(error.statusCode ? {} : { error: error.message })
        });
    } finally {
        await session.endSession();
    }
};

const confirmCODPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        let responseData = null;
        let pointsResult = {
            awarded: false,
            points: 0,
            message: "Đơn hàng chưa đủ điều kiện cộng điểm."
        };

        await session.withTransaction(async () => {
            const order = await Order.findById(id).session(session);

            if (!order) {
                const error = new Error("Không tìm thấy đơn hàng");
                error.statusCode = 404;
                throw error;
            }

            if (order.paymentMethod !== "cod") {
                const error = new Error(
                    "Chỉ áp dụng xác nhận thanh toán cho đơn COD"
                );
                error.statusCode = 400;
                throw error;
            }

            if (order.status !== "completed") {
                const error = new Error(
                    "Chỉ xác nhận thanh toán COD khi đơn hàng đã hoàn thành"
                );
                error.statusCode = 400;
                throw error;
            }

            if (order.paymentStatus === "paid") {
                const error = new Error("Đơn hàng đã được thanh toán");
                error.statusCode = 400;
                throw error;
            }

            if (order.paymentStatus !== "unpaid") {
                const error = new Error(
                    "Trạng thái thanh toán không hợp lệ để xác nhận COD"
                );
                error.statusCode = 400;
                throw error;
            }

            order.paymentStatus = "paid";
            await order.save({ session });

            pointsResult = await awardOrderPoints(order._id, session);

            responseData = {
                order,
                points: pointsResult
            };
        });

        const membership = await updateMembershipTier(
            responseData.order.user
        );

        return res.status(200).json({
            message: "Xác nhận thanh toán COD thành công",
            data: {
                ...responseData,
                membership
            }
        });
    } catch (error) {
        console.error("Confirm COD payment error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Không thể xác nhận thanh toán COD",
            ...(error.statusCode ? {} : { error: error.message })
        });
    } finally {
        await session.endSession();
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    simulatePayment,
    confirmCODPayment
};