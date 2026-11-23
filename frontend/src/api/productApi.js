const API_URL = "http://localhost:3000/api/products";

export const getProducts = async (params = {}) => {

    const queryParams = new URLSearchParams();

    if (params.category) {

        const categoryValue = Array.isArray(params.category)
            ? params.category.join(",")
            : params.category;

        queryParams.append(
            "category",
            categoryValue
        );
    }

    if (params.brand) {

        const brandValue = Array.isArray(params.brand)
            ? params.brand.join(",")
            : params.brand;

        queryParams.append(
            "brand",
            brandValue
        );
    }

    if (params.search) {
        queryParams.append("search", params.search);
    }

    if (params.minPrice !== undefined) {
        queryParams.append("minPrice", params.minPrice);
    }

    if (params.maxPrice !== undefined) {
        queryParams.append("maxPrice", params.maxPrice);
    }

    if (params.sort) {
        queryParams.append("sort", params.sort);
    }

    if (params.page) {
        queryParams.append("page", params.page);
    }

    if (params.limit) {
        queryParams.append("limit", params.limit);
    }

    const url = queryParams.toString()
        ? `${API_URL}?${queryParams.toString()}`
        : API_URL;

    const response = await fetch(url, {
        method: "GET"
    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get products"
        );
    }

    return response.json();
};

export const getProductById = async (id) => {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET"
    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get product"
        );
    }

    return response.json();
};


export const getRelatedProducts = async (id) => {
    const response = await fetch(`${API_URL}/${id}/related`, {
        method: "GET"
    });

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message || "Failed to get related products"
        );
    }

    return response.json();
};


export const getTopSellingProducts = async (period = "day") => {
    const response = await fetch(
        `${API_URL}/top-selling?period=${period}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.message || "Failed to get top selling products"
        );
    }

    return response.json();
};

export const createProduct = async (productData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: productData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to create product"
        );
    }

    return result;
};

export const updateProduct = async (id, productData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: productData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to update product"
        );
    }

    return result;
};

export const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to delete product"
        );
    }

    return result;
};