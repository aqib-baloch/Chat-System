import { Router } from "./app/router.js";
import { getInitialRoute } from "./app/init.js";
import { state } from "./app/state.js";
import { ROUTES } from "./config/constants.js";
import { LoginPage } from "./ui/pages/LoginPage.js";
import { RegisterPage } from "./ui/pages/RegisterPage.js";
import { ChatPage } from "./ui/pages/ChatPage.js";
import { authApi } from "./services/api/auth.api.js";

const router = new Router();

router.addRoute(ROUTES.LOGIN, LoginPage, {
  onLoginSuccess: (response) => {
    state.setUser(response.user);
    router.navigate(ROUTES.CHAT);
  },
});

router.addRoute(ROUTES.REGISTER, RegisterPage, {
  onRegisterSuccess: () => {},
});

router.addRoute(ROUTES.CHAT, ChatPage, () => ({
  user: state.user,
  onLogout: async () => {
    try {
      await authApi.logout();
    } finally {
      state.clearUser();
      router.navigate(ROUTES.LOGIN);
    }
  },
}));

async function startApp() {
  try {
    const initialRoute = await getInitialRoute();

    if (!window.location.hash) {
      window.location.hash = initialRoute;
    }
  } catch (error) {
    console.error("Failed to start app:", error);
    window.location.hash = ROUTES.LOGIN;
  }
}

startApp();
