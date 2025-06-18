import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Get cart by user ID
export const getCartByUser = async (userId) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/cart/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add product to cart
export const addToCart = async (data) => {
  try {
    // Ganti endpoint ke '/api/cart' yang akan ditangani oleh method create()
    const response = await axios.post(`${VITE_API_URL}/api/cart`, data);
    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartQuantity = async (itemId, data) => {
  try {
    // PERBAIKAN: Hapus '/item' dari URL agar cocok dengan Routes.php Anda
    const response = await axios.put(
      `${VITE_API_URL}/api/cart/${itemId}`, // <-- UBAH DI SINI
      data
    );
    return response;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

// Delete cart item
export const deleteCartItem = async (itemId) => {
  try {
    // PERBAIKAN: Hapus '/item' dari URL ini juga untuk konsistensi
    const response = await axios.delete(
      `${VITE_API_URL}/api/cart/${itemId}` // <-- UBAH DI SINI JUGA
    );
    return response;
  } catch (error) {
    console.error('Error deleting cart item:', error);
    throw error;
  }
};

// export const addToCart = async (data) => {
//   try {
//     const response = await axios.post(`${VITE_API_URL}/api/cart/add`, data);
//     return response;
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     throw error;
//   }
// };

// Clear cart
export const clearCart = async (userId) => {
  try {
    const response = await axios.delete(
      `${VITE_API_URL}/api/cart/clear/${userId}`
    );
    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
