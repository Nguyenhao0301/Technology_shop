const Product = require("../models/Product");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const Notification = require("../models/Notification");

const createPromotionNotifications = async (product) => {
    const now = new Date();

    const hasValidPromotion =
        product.discountPrice > 0 &&
        product.discountPrice < product.price &&
        (!product.dealStart || new Date(product.dealStart) <= now) &&
        (!product.dealEnd || new Date(product.dealEnd) >= now);

    if (!hasValidPromotion) {
        return;
    }

    const customers = await User.find({
        role: "customer",
        isActive: true
    }).select("_id");

    if (customers.length === 0) {
        return;
    }

    const notifications = customers.map((customer) => ({
        user: customer._id,
        product: product._id,
        type: "promotion",
        title: "Sản phẩm đang khuyến mãi",
        message: `${product.name} hiện có giá ưu đãi ${Number(
            product.discountPrice
        ).toLocaleString("vi-VN")}đ.`,
        link: `/products/${product._id}`
    }));

    await Notification.insertMany(notifications);
};

// CREATE - Tạo sản phẩm
const createProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            category,
            brand
        } = req.body;

        const price = Number(req.body.price);
        const stock = Number(req.body.stock);
        const discountPrice =
            req.body.discountPrice !== undefined &&
                req.body.discountPrice !== ""
                ? Number(req.body.discountPrice)
                : null;

        const dealStart = req.body.dealStart || null;
        const dealEnd = req.body.dealEnd || null;

        const image = req.file ? req.file.filename : null;

        let specifications = {};

        if (req.body.specifications) {
            try {
                specifications = JSON.parse(req.body.specifications);
            } catch (error) {
                return res.status(400).json({
                    message: "Specifications must be valid JSON"
                });
            }
        }

        // 1. Kiểm tra dữ liệu bắt buộc
        if (!name || Number.isNaN(price) || price < 0 || !category) {
            return res.status(400).json({
                message: "Name, price and category are required, and price must be a valid number"
            });
        }

        // 2. Kiểm tra price
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({
                message: "Price must be a number greater than or equal to 0"
            });
        }

        // 3. Kiểm tra stock
        if (
            stock !== undefined &&
            (typeof stock !== "number" || stock < 0)
        ) {
            return res.status(400).json({
                message: "Stock must be a number greater than or equal to 0"
            });
        }

        // 4. Kiểm tra Category ID
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        // 5. Kiểm tra Category tồn tại
        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        // 6. Kiểm tra Category đang hoạt động
        if (!categoryExists.isActive) {
            return res.status(400).json({
                message: "Category is inactive"
            });
        }

        // 7. Nếu có Brand thì kiểm tra Brand
        if (brand) {

            if (!mongoose.Types.ObjectId.isValid(brand)) {
                return res.status(400).json({
                    message: "Invalid brand ID"
                });
            }

            const brandExists = await Brand.findById(brand);

            if (!brandExists) {
                return res.status(404).json({
                    message: "Brand not found"
                });
            }

            if (!brandExists.isActive) {
                return res.status(400).json({
                    message: "Brand is inactive"
                });
            }
        }

        // 8. Tạo Product
        const product = await Product.create({
            name,
            description,
            specifications,
            price,
            discountPrice,
            dealStart,
            dealEnd,
            image,
            category,
            brand,
            stock: stock ?? 0
        });

        // 9. Lấy lại Product và populate Category + Brand
        const result = await Product.findById(product._id)
            .populate("category")
            .populate("brand");

        // Tạo thông báo khuyến mãi nếu sản phẩm đủ điều kiện
        await createPromotionNotifications(product);

        // 10. Response
        res.status(201).json({
            message: "Product created successfully!",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

// GET - Lấy sản phẩm + tìm kiếm + lọc + sắp xếp + phân trang
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        // Điều kiện mặc định:
        // Chỉ lấy Product đang hoạt động
        const filter = {
            isActive: true
        };

        // SEARCH - Tìm theo tên sản phẩm
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // FILTER - Category
        if (category) {

            const categories = category.split(",").filter(Boolean);

            if (categories.length === 1) {
                filter.category = categories[0];
            } else {
                filter.category = {
                    $in: categories
                };
            }
        }

        // FILTER - Brand
        if (brand) {

            const brands = brand.split(",").filter(Boolean);

            if (brands.length === 1) {
                filter.brand = brands[0];
            } else {
                filter.brand = {
                    $in: brands
                };
            }
        }

        if (minPrice !== undefined && isNaN(Number(minPrice))) {
            return res.status(400).json({
                message: "minPrice must be a valid number"
            });
        }

        if (maxPrice !== undefined && isNaN(Number(maxPrice))) {
            return res.status(400).json({
                message: "maxPrice must be a valid number"
            });
        }

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            Number(minPrice) > Number(maxPrice)
        ) {
            return res.status(400).json({
                message: "minPrice cannot be greater than maxPrice"
            });
        }

        // FILTER - Giá thấp nhất
        if (minPrice) {
            filter.price = {
                ...filter.price,
                $gte: Number(minPrice)
            };
        }

        // FILTER - Giá cao nhất
        if (maxPrice) {
            filter.price = {
                ...filter.price,
                $lte: Number(maxPrice)
            };
        }

        // SORT
        let sortOption = {};

        switch (sort) {
            case "price_asc":
                sortOption.price = 1;
                break;

            case "price_desc":
                sortOption.price = -1;
                break;

            case "name_asc":
                sortOption.name = 1;
                break;

            case "name_desc":
                sortOption.name = -1;
                break;

            case "newest":
                sortOption.createdAt = -1;
                break;

            default:
                sortOption.createdAt = -1;
        }

        // PAGINATION
        const currentPage = Math.max(Number(page), 1);
        const itemsPerPage = Math.max(Number(limit), 1);
        const skip = (currentPage - 1) * itemsPerPage;

        // Đếm tổng số Product phù hợp
        const totalProducts = await Product.countDocuments(filter);

        // Lấy Product
        const products = await Product.find(filter)
            .populate("category")
            .populate("brand")
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage);

        // Tổng số trang
        const totalPages = Math.ceil(
            totalProducts / itemsPerPage
        );

        res.status(200).json({
            message: "Get products successfully!",
            data: products,
            pagination: {
                currentPage,
                itemsPerPage,
                totalProducts,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get products",
            error: error.message
        });
    }
};

// GET Top Selling Products
const getTopSellingProducts = async (req, res) => {
    try {
        const { period = "day" } = req.query;

        // Chỉ cho phép 3 loại
        if (!["day", "week", "month"].includes(period)) {
            return res.status(400).json({
                message: "Period must be day, week or month"
            });
        }

        const now = new Date();
        const startDate = new Date(now);

        // TOP NGÀY
        if (period === "day") {
            startDate.setHours(0, 0, 0, 0);
        }

        // TOP TUẦN
        if (period === "week") {
            startDate.setHours(0, 0, 0, 0);

            // Tuần bắt đầu từ thứ 2
            const day = startDate.getDay();
            const diff = day === 0 ? 6 : day - 1;

            startDate.setDate(startDate.getDate() - diff);
        }

        // TOP THÁNG
        if (period === "month") {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        const products = await OrderItem.aggregate([
            // Lấy thông tin Order
            {
                $lookup: {
                    from: Order.collection.name,
                    localField: "order",
                    foreignField: "_id",
                    as: "orderData"
                }
            },

            {
                $unwind: "$orderData"
            },

            // Chỉ tính đơn đã hoàn thành
            // và nằm trong khoảng thời gian
            {
                $match: {
                    "orderData.status": "completed",
                    "orderData.createdAt": {
                        $gte: startDate,
                        $lte: now
                    }
                }
            },

            // Gom theo sản phẩm
            {
                $group: {
                    _id: "$product",
                    totalSold: {
                        $sum: "$quantity"
                    }
                }
            },

            // Sắp xếp bán nhiều nhất trước
            {
                $sort: {
                    totalSold: -1
                }
            },

            // Lấy top 4
            {
                $limit: 4
            },

            // Lấy thông tin Product    
            {
                $lookup: {
                    from: Product.collection.name,
                    localField: "_id",
                    foreignField: "_id",
                    as: "productData"
                }
            },

            {
                $unwind: "$productData"
            },

            // Chỉ lấy sản phẩm đang active
            {
                $match: {
                    "productData.isActive": true
                }
            },

            // Chọn dữ liệu trả về
            {
                $project: {
                    _id: "$productData._id",
                    name: "$productData.name",
                    description: "$productData.description",
                    price: "$productData.price",
                    image: "$productData.image",
                    stock: "$productData.stock",
                    category: "$productData.category",
                    brand: "$productData.brand",
                    totalSold: 1
                }
            }
        ]);

        return res.status(200).json({
            message: "Get top selling products successfully!",
            period,
            data: products
        });

    } catch (error) {
        console.error("Get top selling products error:", error);
        return res.status(500).json({
            message: "Failed to get top selling products",
            error: error.message
        });
    }
};

// GET - Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng ObjectId hay không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("brand");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Get product successfully!",
            data: product
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });
    }
};

// GET - Lấy sản phẩm liên quan
const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID sản phẩm
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        // Lấy sản phẩm hiện tại
        const product = await Product.findById(id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Ưu tiên sản phẩm cùng danh mục
        const relatedFilter = {
            _id: { $ne: product._id },
            isActive: true,
            category: product.category
        };

        let relatedProducts = await Product.find(relatedFilter)
            .populate("category")
            .populate("brand")
            .sort({ createdAt: -1 })
            .limit(8);

        // Nếu chưa đủ 8 sản phẩm, bổ sung sản phẩm cùng thương hiệu
        if (relatedProducts.length < 8 && product.brand) {
            const existingIds = [
                product._id,
                ...relatedProducts.map((item) => item._id)
            ];

            const additionalProducts = await Product.find({
                _id: { $nin: existingIds },
                isActive: true,
                brand: product.brand
            })
                .populate("category")
                .populate("brand")
                .sort({ createdAt: -1 })
                .limit(8 - relatedProducts.length);

            relatedProducts = [
                ...relatedProducts,
                ...additionalProducts
            ];
        }

        return res.status(200).json({
            message: "Get related products successfully!",
            data: relatedProducts
        });
    } catch (error) {
        console.error("Get related products error:", error);
        return res.status(500).json({
            message: "Failed to get related products",
            error: error.message
        });
    }
};

// UPDATE - Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng ObjectId hay không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const {
            name,
            description,
            category,
            brand
        } = req.body;

        const price =
            req.body.price !== undefined && req.body.price !== ""
                ? Number(req.body.price)
                : undefined;
        const stock = Number(req.body.stock);
        const discountPrice =
            req.body.discountPrice !== undefined &&
                req.body.discountPrice !== ""
                ? Number(req.body.discountPrice)
                : null;

        const dealStart = req.body.dealStart || null;
        const dealEnd = req.body.dealEnd || null;
        // Lấy thông tin sản phẩm hiện tại trước khi cập nhật
        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        // Kiểm tra chương trình khuyến mãi có thay đổi không
        const oldDiscountPrice = existingProduct.discountPrice ?? null;
        const oldDealStart = existingProduct.dealStart
            ? new Date(existingProduct.dealStart).getTime()
            : null;
        const oldDealEnd = existingProduct.dealEnd
            ? new Date(existingProduct.dealEnd).getTime()
            : null;

        const newDiscountPrice =
            req.body.discountPrice !== undefined
                ? discountPrice
                : oldDiscountPrice;

        const newDealStart =
            req.body.dealStart !== undefined
                ? dealStart
                : existingProduct.dealStart;

        const newDealEnd =
            req.body.dealEnd !== undefined
                ? dealEnd
                : existingProduct.dealEnd;

        const promotionChanged =
            Number(newDiscountPrice ?? 0) !==
            Number(oldDiscountPrice ?? 0) ||
            (newDealStart
                ? new Date(newDealStart).getTime()
                : null) !== oldDealStart ||
            (newDealEnd
                ? new Date(newDealEnd).getTime()
                : null) !== oldDealEnd;

        let specifications = {};

        if (req.body.specifications) {
            try {
                specifications = JSON.parse(req.body.specifications);
            } catch (error) {
                return res.status(400).json({
                    message: "Specifications must be valid JSON"
                });
            }
        }

        const image = req.file
            ? req.file.filename
            : req.body.image;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(req.body.specifications !== undefined && { specifications }),
                ...(price !== undefined && { price }),
                ...(req.body.discountPrice !== undefined && {
                    discountPrice: discountPrice
                }),
                ...(req.body.dealStart !== undefined && {
                    dealStart: dealStart
                }),
                ...(req.body.dealEnd !== undefined && {
                    dealEnd: dealEnd
                }),
                ...(image !== undefined && { image }),
                ...(category !== undefined && { category }),
                ...(brand !== undefined && { brand }),
                ...(req.body.stock !== undefined && { stock })
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("category")
            .populate("brand");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Tạo thông báo nếu chương trình khuyến mãi thực sự thay đổi
        if (promotionChanged) {
            await createPromotionNotifications(product);
        }

        res.status(200).json({
            message: "Product updated successfully!",
            data: product
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

// DELETE - Soft delete Product
const deleteProduct = async (req, res) => {
    try {

        // Kiểm tra ID có đúng định dạng ObjectId hay không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        )
            .populate("category")
            .populate("brand");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully!",
            data: product
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};

// GET - Lấy danh sách Flash Deals đang có hiệu lực
const getFlashDeals = async (req, res) => {
    try {
        const now = new Date();

        const products = await Product.find({
            isActive: true,
            discountPrice: { $gt: 0 },
            dealStart: { $lte: now },
            dealEnd: { $gte: now }
        })
            .populate("category")
            .populate("brand")
            .sort({ dealEnd: 1 });

        const validProducts = products.filter(
            (product) => product.discountPrice < product.price
        );

        return res.status(200).json({
            message: "Get flash deals successfully!",
            data: validProducts
        });
    } catch (error) {
        console.error("Get flash deals error:", error);

        return res.status(500).json({
            message: "Failed to get flash deals",
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getTopSellingProducts,
    getProductById,
    getRelatedProducts,
    updateProduct,
    deleteProduct,
    getFlashDeals
};
