const axios = window.axios;
import { API_BASE_URL } from "../../config/env.js";
import { getToken, clearToken } from "./tokenStore.js";
import { ROUTES } from "../../config/constants.js";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.hash !== ROUTES.LOGIN) {
        window.location.hash = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
