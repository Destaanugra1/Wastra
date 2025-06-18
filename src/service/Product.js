import axios from 'axios';

const ApiUrl = import.meta.env.VITE_API_URL;

// export function login(email, password) {
//   return axios.post(`${ApiUrl}/login`, {email, password})
// }

export function create(formData) {
  return axios.post(`${ApiUrl}/product/create`, formData);
}

export function getProductById(id) {
  return axios.get(`${ApiUrl}/product/${id}`);
}

export function updateProductStock(id, quantity_sold) {
  return axios.post(`${ApiUrl}/product/update-stock/${id}`, { quantity_sold });
}

export function listProduct() {
  return axios.get(`${ApiUrl}/product`);
}

export function updateProduct(id, formData) {
  return axios.post(`${ApiUrl}/product/update/${id}`, formData);
}

export function deleteProduct(id) {
  return axios.delete(`${ApiUrl}/product/delete/${id}`);
}

export function getCategory() {
  return axios.get(`${ApiUrl}/category`);
}
