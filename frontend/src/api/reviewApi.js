const API_URL = "http://localhost:3000/api/reviews";

export const getReviewsByProduct = async (productId) => {
  const response = await fetch(`${API_URL}/product/${productId}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get reviews");
  }

  return result;
};

export const createReview = async (reviewData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in to review this product");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create review");
  }

  return result;
};