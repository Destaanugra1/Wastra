import axios from "axios";
import { decryptId } from "../lib/idEncryption";

const ApiUrl = import.meta.env.VITE_API_URL;

// Function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function getUserById(id) {
  // Jika id adalah token terenkripsi, dekripsi dulu
  const actualId = typeof id === 'string' && id.length > 10 ? decryptId(id) : id;
  
  if (!actualId) {
    return Promise.reject(new Error('Invalid user ID'));
  }

  console.log('getUserById called with actualId:', actualId);
  
  return axios.get(`${ApiUrl}/user/${actualId}`, {
    headers: getAuthHeaders()
  });
}

export function updateUser(id, data) {
  // Jika id adalah token terenkripsi, dekripsi dulu  
  const actualId = typeof id === 'string' && id.length > 10 ? decryptId(id) : id;
  
  if (!actualId) {
    return Promise.reject(new Error('Invalid user ID'));
  }
  
  return axios.put(`${ApiUrl}/user/update/${actualId}`, data, {
    headers: getAuthHeaders()
  });
}