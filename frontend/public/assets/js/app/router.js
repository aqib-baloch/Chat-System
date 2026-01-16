import { ROUTES } from "../config/constants.js";

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentPage = null;
    this.nextState = null;

    window.addEventListener("hashchange", () => this.handleRoute());
    window.addEventListener("load", () => this.handleRoute());
  }

  /**
   * Register a route
   * @param {string} path - Route path (e.g., '#/login')
   * @param {Function} pageConstructor - Page component constructor
   * @param {Object} options - Additional options
   */
  addRoute(path, pageConstructor, options = {}) {
    this.routes.set(path, { pageConstructor, options });
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path
   * @param {Object} state - State to pass to the page
   */
  navigate(path, state = {}) {
    this.nextState = state;
    window.location.hash = path;
  }

  /**
   * Handle route changes
   */
  handleRoute() {
    const hash = window.location.hash || "#/login";
    const route = this.routes.get(hash);

    if (!route) {
      console.warn(`Route ${hash} not found, redirecting to login`);
      this.navigate(ROUTES.LOGIN);
      return;
    }

    // Clean up current page
    if (this.currentPage && typeof this.currentPage.destroy === "function") {
      this.currentPage.destroy();
    }

    // Create new page
    try {
      const baseOptions =
        typeof route.options === "function" ? route.options() : route.options;
      const mergedOptions = { ...(baseOptions || {}), ...(this.nextState || {}) };
      this.nextState = null;

      this.currentPage = new route.pageConstructor(mergedOptions);
      this.currentRoute = hash;

      // Render page
      const appElement = document.getElementById("app");
      if (appElement) {
        appElement.innerHTML = "";
        appElement.appendChild(this.currentPage.getElement());
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      this.navigate(ROUTES.LOGIN);
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getCurrentPage() {
    return this.currentPage;
  }

  isAuthenticated() {
    return false;
  }
}
