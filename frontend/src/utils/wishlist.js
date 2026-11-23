const WISHLIST_KEY = "wishlist";

export const getWishlist = () => {
  const storedWishlist = localStorage.getItem(WISHLIST_KEY);

  try {
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch {
    return [];
  }
};

export const saveWishlist = (wishlist) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  window.dispatchEvent(new Event("wishlistChanged"));
};

export const isInWishlist = (productId) =>
  getWishlist().some((item) => item.productId === productId);

export const toggleWishlist = (product) => {
  const wishlist = getWishlist();
  const existingItem = wishlist.find(
    (item) => item.productId === product._id,
  );

  const updatedWishlist = existingItem
    ? wishlist.filter((item) => item.productId !== product._id)
    : [
        ...wishlist,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        },
      ];

  saveWishlist(updatedWishlist);
  return !existingItem;
};

export const removeFromWishlist = (productId) => {
  saveWishlist(getWishlist().filter((item) => item.productId !== productId));
};
