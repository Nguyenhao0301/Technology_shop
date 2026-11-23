const mongoose = require("mongoose");

const InventoryTransaction = require("../models/InventoryTransaction");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
// GET - Lấy danh sách Inventory Transaction
const getTransactions = async (req, res) => {
    try {

        const transactions = await InventoryTransaction.find()
            .populate("warehouse")
            .populate("product")
            .populate("fromWarehouse")
            .populate("toWarehouse")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get transactions successfully!",
            data: transactions
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get transactions",
            error: error.message
        });

    }
};

// GET - Lấy Transaction theo ID
const getTransactionById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }

        const transaction = await InventoryTransaction.findById(req.params.id)
            .populate("warehouse")
            .populate("product")
            .populate("fromWarehouse")
            .populate("toWarehouse");

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Get transaction successfully!",
            data: transaction
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get transaction",
            error: error.message
        });

    }
};

// POST - Tạo Inventory Transaction
const createTransaction = async (req, res) => {
    try {

        const {
            type,
            warehouse,
            product,
            quantity,
            fromWarehouse,
            toWarehouse,
            note
        } = req.body;


        // Kiểm tra dữ liệu bắt buộc
        if (!type || !product || quantity === undefined) {
            return res.status(400).json({
                message: "Type, product and quantity are required"
            });
        }


        // Kiểm tra type
        if (!["import", "export", "transfer"].includes(type)) {
            return res.status(400).json({
                message: "Invalid transaction type"
            });
        }


        // Kiểm tra quantity
        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }


        // Kiểm tra Product ID
        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }


        // Kiểm tra Product tồn tại
        const productExists = await Product.findById(product);

        if (!productExists) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        // Kiểm tra Product active
        if (!productExists.isActive) {
            return res.status(400).json({
                message: "Product is inactive"
            });
        }


        // =====================================================
        // IMPORT
        // =====================================================

        if (type === "import") {

            if (!warehouse) {
                return res.status(400).json({
                    message: "Warehouse is required for import"
                });
            }


            if (!mongoose.Types.ObjectId.isValid(warehouse)) {
                return res.status(400).json({
                    message: "Invalid warehouse ID"
                });
            }


            const warehouseExists = await Warehouse.findById(warehouse);

            if (!warehouseExists) {
                return res.status(404).json({
                    message: "Warehouse not found"
                });
            }


            if (!warehouseExists.isActive) {
                return res.status(400).json({
                    message: "Warehouse is inactive"
                });
            }


            // Tìm inventory của warehouse + product
            let inventory = await Inventory.findOne({
                warehouse,
                product
            });


            if (inventory) {

                inventory.quantity += quantity;
                inventory.isActive = true;

                await inventory.save();

            } else {

                inventory = await Inventory.create({
                    warehouse,
                    product,
                    quantity,
                    isActive: true
                });

            }


            // Tạo transaction
            const transaction = await InventoryTransaction.create({
                type,
                warehouse,
                product,
                quantity,
                note
            });


            const result = await InventoryTransaction.findById(transaction._id)
                .populate("warehouse")
                .populate("product")
                .populate("fromWarehouse")
                .populate("toWarehouse");


            return res.status(201).json({
                message: "Transaction created successfully!",
                data: result
            });
        }


        // =====================================================
        // EXPORT
        // =====================================================

        if (type === "export") {

            if (!warehouse) {
                return res.status(400).json({
                    message: "Warehouse is required for export"
                });
            }


            if (!mongoose.Types.ObjectId.isValid(warehouse)) {
                return res.status(400).json({
                    message: "Invalid warehouse ID"
                });
            }


            const warehouseExists = await Warehouse.findById(warehouse);

            if (!warehouseExists) {
                return res.status(404).json({
                    message: "Warehouse not found"
                });
            }


            if (!warehouseExists.isActive) {
                return res.status(400).json({
                    message: "Warehouse is inactive"
                });
            }


            const inventory = await Inventory.findOne({
                warehouse,
                product
            });


            if (!inventory) {
                return res.status(404).json({
                    message: "Inventory not found for this warehouse and product"
                });
            }


            if (!inventory.isActive) {
                return res.status(400).json({
                    message: "Inventory is inactive"
                });
            }


            if (inventory.quantity < quantity) {
                return res.status(400).json({
                    message: "Insufficient inventory"
                });
            }


            // Trừ tồn kho
            inventory.quantity -= quantity;

            await inventory.save();


            // Tạo transaction
            const transaction = await InventoryTransaction.create({
                type,
                warehouse,
                product,
                quantity,
                note
            });


            const result = await InventoryTransaction.findById(transaction._id)
                .populate("warehouse")
                .populate("product")
                .populate("fromWarehouse")
                .populate("toWarehouse");


            return res.status(201).json({
                message: "Transaction created successfully!",
                data: result
            });
        }


        // =====================================================
        // TRANSFER
        // =====================================================

        if (type === "transfer") {

            if (!fromWarehouse || !toWarehouse) {
                return res.status(400).json({
                    message: "fromWarehouse and toWarehouse are required for transfer"
                });
            }


            // Kiểm tra ID kho
            if (
                !mongoose.Types.ObjectId.isValid(fromWarehouse) ||
                !mongoose.Types.ObjectId.isValid(toWarehouse)
            ) {
                return res.status(400).json({
                    message: "Invalid warehouse ID"
                });
            }


            // Không cho chuyển cùng một kho
            if (fromWarehouse === toWarehouse) {
                return res.status(400).json({
                    message: "Source and destination warehouse cannot be the same"
                });
            }


            // Kiểm tra kho nguồn
            const sourceWarehouse = await Warehouse.findById(fromWarehouse);

            if (!sourceWarehouse) {
                return res.status(404).json({
                    message: "Source warehouse not found"
                });
            }


            if (!sourceWarehouse.isActive) {
                return res.status(400).json({
                    message: "Source warehouse is inactive"
                });
            }


            // Kiểm tra kho đích
            const destinationWarehouse = await Warehouse.findById(toWarehouse);

            if (!destinationWarehouse) {
                return res.status(404).json({
                    message: "Destination warehouse not found"
                });
            }


            if (!destinationWarehouse.isActive) {
                return res.status(400).json({
                    message: "Destination warehouse is inactive"
                });
            }


            // Tìm inventory kho nguồn
            const sourceInventory = await Inventory.findOne({
                warehouse: fromWarehouse,
                product
            });


            if (!sourceInventory) {
                return res.status(404).json({
                    message: "Source inventory not found"
                });
            }


            if (!sourceInventory.isActive) {
                return res.status(400).json({
                    message: "Source inventory is inactive"
                });
            }


            if (sourceInventory.quantity < quantity) {
                return res.status(400).json({
                    message: "Insufficient inventory in source warehouse"
                });
            }


            // Tìm inventory kho đích
            let destinationInventory = await Inventory.findOne({
                warehouse: toWarehouse,
                product
            });


            // Trừ kho nguồn
            sourceInventory.quantity -= quantity;

            await sourceInventory.save();


            // Cộng kho đích
            if (destinationInventory) {

                destinationInventory.quantity += quantity;
                destinationInventory.isActive = true;

                await destinationInventory.save();

            } else {

                destinationInventory = await Inventory.create({
                    warehouse: toWarehouse,
                    product,
                    quantity,
                    isActive: true
                });

            }


            // Tạo transaction
            const transaction = await InventoryTransaction.create({
                type,
                product,
                quantity,
                fromWarehouse,
                toWarehouse,
                note
            });


            const result = await InventoryTransaction.findById(transaction._id)
                .populate("warehouse")
                .populate("product")
                .populate("fromWarehouse")
                .populate("toWarehouse");


            return res.status(201).json({
                message: "Transaction created successfully!",
                data: result
            });
        }

    } catch (error) {

        res.status(500).json({
            message: "Failed to create transaction",
            error: error.message
        });

    }
};


module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction
};