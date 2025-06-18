import axios from "axios";

const ApiUrl = import.meta.env.VITE_API_URL;

export function login(email, password) {
  return axios.post(`${ApiUrl}/login`, {email, password})
}

export function register(nama, email, password, provinsi, kabupaten, deskripsi_alamat) {
  return axios.post(`${ApiUrl}/register`, {nama, email, password, provinsi, kabupaten, deskripsi_alamat})
}



export function listUsers() {
  return axios.get(`${ApiUrl}/user`)
}