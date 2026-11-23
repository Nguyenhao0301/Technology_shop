const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse");

// GET - Lấy danh sách Warehouse
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Get warehouses successfully!",
            data: warehouses
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get warehouses",
            error: error.message
        });
    }
};


// GET - Lấy Warehouse theo ID
const getWarehouseById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid warehouse ID"
            });
        }

        const warehouse = await Warehouse.findById(req.params.id);

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json({
            message: "Get warehouse successfully!",
            data: warehouse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get warehouse",
            error: error.message
        });
    }
};


// POST - Tạo Warehouse
const createWarehouse = async (req, res) => {
    try {

        const {
            name,
            type,
            address,
            phone
        } = req.body;

        if (!name || !type || !address) {
            return res.status(400).json({
                message: "Name, type and address are required"
            });
        }

        const warehouse = await Warehouse.create({
            name,
            type,
            address,
            phone
        });

        res.status(201).json({
            message: "Warehouse created successfully!",
            data: warehouse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create warehouse",
            error: error.message
        });
    }
};


// PUT - Cập nhật Warehouse
const updateWarehouse = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid warehouse ID"
            });
        }

        const {
            name,
            type,
            address,
            phone,
            isActive
        } = req.body;

        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            {
                name,
                type,
                address,
                phone,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json({
            message: "Warehouse updated successfully!",
            data: warehouse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update warehouse",
            error: error.message
        });
    }
};


// DELETE - Soft delete Warehouse
const deleteWarehouse = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid warehouse ID"
            });
        }

        const warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.status(200).json({
            message: "Warehouse deleted successfully!",
            data: warehouse
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete warehouse",
            error: error.message
        });
    }
};


module.exports = {
    getWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
};