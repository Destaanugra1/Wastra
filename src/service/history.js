import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Get purchase history by user ID
export const getPurchaseHistoryByUser = async (userId) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/history/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    throw error;
  }
};
