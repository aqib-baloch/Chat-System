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

  addRoute(path, pageConstructor, options = {}) {
    this.routes.set(path, { pageConstructor, options });
  }

  navigate(path, state = {}) {
    this.nextState = state;
    window.location.hash = path;
  }

  handleRoute() {
    const fullHash = window.location.hash || "#/login";
    const qPos = fullHash.indexOf("?");
    const hash = qPos === -1 ? fullHash : fullHash.slice(0, qPos);
    const queryString = qPos === -1 ? "" : fullHash.slice(qPos + 1);
    const route = this.routes.get(hash);

    if (!route) {
      console.warn(`Route ${hash} not found, redirecting to login`);
      this.navigate(ROUTES.LOGIN);
      return;
    }

    if (this.currentPage && typeof this.currentPage.destroy === "function") {
      this.currentPage.destroy();
    }

    try {
      const baseOptions =
        typeof route.options === "function" ? route.options() : route.options;
      const mergedOptions = {
        ...(baseOptions || {}),
        ...(this.nextState || {}),
        query: Object.fromEntries(new URLSearchParams(queryString).entries()),
      };
      this.nextState = null;

      this.currentPage = new route.pageConstructor(mergedOptions);
      this.currentRoute = hash;

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
