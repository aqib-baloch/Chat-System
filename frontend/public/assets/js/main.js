import { Router } from './app/router.js';
import { getInitialRoute } from './app/init.js';
import { state } from './app/state.js';
import { ROUTES } from './config/constants.js';
import { LoginPage } from './ui/pages/LoginPage.js';
import { RegisterPage } from './ui/pages/RegisterPage.js';
import { ChatPage } from './ui/pages/ChatPage.js';
import { authApi } from './services/api/auth.api.js';

/**
 * Main application entry point
 */

// Initialize router
const router = new Router();

// Register routes
router.addRoute(ROUTES.LOGIN, LoginPage, {
  onLoginSuccess: (response) => {
    // Update state with user data
    state.setUser(response.user);
    // Navigate to chat
    router.navigate(ROUTES.CHAT);
  }
});

router.addRoute(ROUTES.REGISTER, RegisterPage, {
  onRegisterSuccess: () => {
    // Registration success handled in RegisterPage
  }
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
  }
}));

// Start the application
async function startApp() {
  try {
    // Initialize app (check authentication, load user data)
    const initialRoute = await getInitialRoute();

    // Set initial hash if not set
    if (!window.location.hash) {
      window.location.hash = initialRoute;
    }

    console.log('Chat App started successfully');

  } catch (error) {
    console.error('Failed to start app:', error);
    // Fallback to login
    window.location.hash = ROUTES.LOGIN;
  }
}

// Start the app
startApp();
