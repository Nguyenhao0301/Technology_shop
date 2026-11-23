const CART_KEY = "cart";

export const getCart = () => {
    const cart = localStorage.getItem(CART_KEY);

    return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
};

export const addToCart = (product, quantity = 1) => {

    const cart = getCart();

    const existingItem = cart.find(
        item => item.productId === product._id
    );

    if (existingItem) {

        const newQuantity =
            existingItem.quantity + quantity;

        if (newQuantity > product.stock) {

            alert(
                `Only ${product.stock} items available`
            );

            return;
        }

        existingItem.quantity = newQuantity;

    } else {

        if (quantity > product.stock) {

            alert(
                `Only ${product.stock} items available`
            );

            return;
        }

        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
            quantity: quantity
        });
    }

    saveCart(cart);

    window.dispatchEvent(
        new Event("cartChanged")
    );
};

// XÓA TOÀN BỘ GIỎ HÀNG
export const clearCart = () => {
    localStorage.removeItem(CART_KEY);

    window.dispatchEvent(
        new Event("cartChanged")
    );
};