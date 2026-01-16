import axiosClient from "../http/axiosClient.js";
import { setToken, clearToken } from "../http/tokenStore.js";

export const authApi = {
  async register(userData) {
    const response = await axiosClient.post("/register", userData);
    return response.data;
  },

  async login(credentials) {
    const response = await axiosClient.post("/login", credentials);
    const data = response.data;

    if (data.token) {
      setToken(data.token);
      const me = await axiosClient.get("/getUser");
      data.user = me.data.user;
    }

    return data;
  },

  async logout() {
    const response = await axiosClient.post("/logout");

    clearToken();
    return response.data;
  },

  async getCurrentUser() {
    const response = await axiosClient.get("/getUser");
    return response.data;
  },
};
