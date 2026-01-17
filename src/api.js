import axios from "axios";
import { getToken } from "./keycloak";


const api = axios.create({
  baseURL: "https://3.64.180.31.sslip.io",
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
