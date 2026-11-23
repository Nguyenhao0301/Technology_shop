const mongoose = require("mongoose");

const Inventory = require("../models/Inventory");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");


// GET - Lấy danh sách Inventory
const getInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find()
            .populate("warehouse")
            .populate("product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get inventories successfully!",
            data: inventories
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get inventories",
            error: error.message
        });
    }
};


// GET - Lấy Inventory theo ID
const getInventoryById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid inventory ID"
            });
        }

        const inventory = await Inventory.findById(req.params.id)
            .populate("warehouse")
            .populate("product");

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }

        res.status(200).json({
            message: "Get inventory successfully!",
            data: inventory
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get inventory",
            error: error.message
        });
    }
};


// POST - Tạo Inventory
const createInventory = async (req, res) => {
    try {

        const {
            warehouse,
            product,
            quantity
        } = req.body;


        // Kiểm tra dữ liệu bắt buộc
        if (!warehouse || !product || quantity === undefined) {
            return res.status(400).json({
                message: "Warehouse, product and quantity are required"
            });
        }


        // Kiểm tra quantity
        if (quantity < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative"
            });
        }


        // Kiểm tra Warehouse
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


        // Kiểm tra Product
        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const productExists = await Product.findById(product);

        if (!productExists) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        // Kiểm tra Inventory đã tồn tại
        const existingInventory = await Inventory.findOne({
            warehouse,
            product
        });

        if (existingInventory) {
            return res.status(400).json({
                message: "Inventory for this product in this warehouse already exists"
            });
        }


        // Tạo Inventory
        const inventory = await Inventory.create({
            warehouse,
            product,
            quantity
        });


        // Lấy lại dữ liệu có populate
        const result = await Inventory.findById(inventory._id)
            .populate("warehouse")
            .populate("product");


        res.status(201).json({
            message: "Inventory created successfully!",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create inventory",
            error: error.message
        });
    }
};


// PUT - Cập nhật Inventory
const updateInventory = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid inventory ID"
            });
        }


        const {
            quantity,
            isActive
        } = req.body;


        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative"
            });
        }


        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            {
                quantity,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("warehouse")
            .populate("product");


        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }


        res.status(200).json({
            message: "Inventory updated successfully!",
            data: inventory
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update inventory",
            error: error.message
        });
    }
};


// DELETE - Soft delete Inventory
const deleteInventory = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid inventory ID"
            });
        }


        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        )
            .populate("warehouse")
            .populate("product");


        if (!inventory) {
            return res.status(404).json({
                message: "Inventory not found"
            });
        }


        res.status(200).json({
            message: "Inventory deleted successfully!",
            data: inventory
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete inventory",
            error: error.message
        });
    }
};


module.exports = {
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory
};