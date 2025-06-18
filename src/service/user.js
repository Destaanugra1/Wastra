import axios from "axios";

const ApiUrl = import.meta.env.VITE_API_URL;


export function getUserById(id) {
  return axios.get(`${ApiUrl}/user/${id}`)
}