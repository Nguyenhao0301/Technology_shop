const STORAGE_KEY = "recentlyViewedProducts";
const MAX_RECENT_PRODUCTS = 10;

// Lấy danh sách sản phẩm đã xem
export const getRecentlyViewed = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const products = saved ? JSON.parse(saved) : [];

        return Array.isArray(products) ? products : [];
    } catch (error) {
        console.error("Failed to load recently viewed products:", error);
        return [];
    }
};

// Lưu sản phẩm vừa xem lên đầu danh sách
export const addRecentlyViewed = (product) => {
    if (!product?._id) return;

    try {
        const currentProducts = getRecentlyViewed();

        // Xóa bản ghi cũ nếu sản phẩm đã tồn tại
        const filteredProducts = currentProducts.filter(
            (item) => item._id !== product._id
        );


        const updatedProducts = [
            {
                _id: product._id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice ?? null,
                image: product.image || "",
                brand: product.brand?.name || "",
                category:
                    typeof product.category === "object"
                        ? product.category?._id || product.category?.name || ""
                        : product.category || "",
                viewedAt: new Date().toISOString(),
            },
            ...filteredProducts,
        ].slice(0, MAX_RECENT_PRODUCTS);


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedProducts)
        );
        window.dispatchEvent(new Event("recentlyViewedUpdated"));
    } catch (error) {
        console.error("Failed to save recently viewed product:", error);
    }
};

// Xóa toàn bộ lịch sử xem
export const clearRecentlyViewed = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("recentlyViewedUpdated"));
};