import { getToken } from "../services/http/tokenStore.js";
import { authApi } from "../services/api/auth.api.js";
import { state } from "./state.js";
import { showError } from "../utils/notify.js";

export async function initApp() {
  console.log("Initializing Chat App...");

  const token = getToken();

  if (token) {
    try {
      console.log("Token found, validating...");

      const response = await authApi.getCurrentUser();
      state.setUser(response.user);

      console.log("User authenticated:", response.user.email);
      return { authenticated: true, user: response.user };
    } catch (error) {
      console.warn("Token validation failed:", error);

      showError("Your session has expired. Please sign in again.");
      return { authenticated: false, error: "invalid_token" };
    }
  } else {
    console.log("No token found, user not authenticated");
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
