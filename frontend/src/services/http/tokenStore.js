import { STORAGE_KEYS } from "../../config/constants.js";

export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const clearToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};
