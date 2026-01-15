import { getToken } from "../services/http/tokenStore.js";
import { authApi } from "../services/api/auth.api.js";
import { state } from "./state.js";
import { showError } from "../utils/notify.js";

export async function initApp() {
  const token = getToken();

  if (token) {
    try {
      const response = await authApi.getCurrentUser();
      state.setUser(response.user);

      return { authenticated: true, user: response.user };
    } catch (error) {
      console.warn("Token validation failed:", error);

      showError("Your session has expired. Please sign in again.");
      return { authenticated: false, error: "invalid_token" };
    }
  } else {
    return { authenticated: false, error: "no_token" };
  }
}

export async function getInitialRoute() {
  const initResult = await initApp();

  if (initResult.authenticated) {
    return "#/chat";
  } else {
    return "#/login";
  }
}
