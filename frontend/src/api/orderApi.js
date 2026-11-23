const API_URL = "http://localhost:3000/api/orders";

export const createOrder = async (orderData) => {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to create order"
        );
    }

    return result;
};

export const getMyOrders = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(
        "http://localhost:3000/api/orders/my-orders",
        {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to get orders"
        );
    }

    return result;
};

export const getOrderById = async (id) => {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(
        `http://localhost:3000/api/orders/${id}`,
        {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to get order"
        );
    }

    return result;
};

export const cancelOrder = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(
        `http://localhost:3000/api/orders/${id}/cancel`,
        {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to cancel order"
        );
    }

    return result;
};

export const getAllOrders = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(API_URL, {
        method: "GET",

        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to get all orders"
        );
    }

    return result;
};


export const updateOrderStatus = async (id, status) => {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(
        `${API_URL}/${id}/status`,
        {
            method: "PUT",

            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: status
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to update order status"
        );
    }

    return result;
};


export const simulatePayment = async (id, result) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("You must be logged in");
    }

    const response = await fetch(
        `${API_URL}/${id}/simulate-payment`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ result })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to process simulated payment"
        );
    }

    return data;
};
