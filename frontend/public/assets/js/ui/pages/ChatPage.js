import { createElement } from "../../utils/dom.js";
import { AppShell } from "../layouts/AppShell.js";

/**
 * Chat Page Component (Placeholder)
 * This will be expanded when chat functionality is implemented
 */
export class ChatPage {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      user: null,
      onLogout: null,
      ...options,
    };

    this.render();
  }

  render() {
    const appShell = new AppShell({
      user: this.options.user,
      onLogout: this.options.onLogout,
      content: this.createChatContent(),
    });

    this.element = appShell.getElement();
    return this.element;
  }

  createChatContent() {
    const container = createElement("div", { className: "space-y-6" });

    // Welcome message
    const welcome = createElement("div", { className: "text-center" });
    const title = createElement(
      "h1",
      { className: "text-2xl font-bold text-gray-900" },
      "Welcome to Chat System"
    );
    const subtitle = createElement(
      "p",
      { className: "mt-2 text-gray-600" },
      "Chat functionality is coming soon!"
    );
    welcome.appendChild(title);
    welcome.appendChild(subtitle);
    container.appendChild(welcome);

    // Placeholder content
    const placeholder = createElement("div", {
      className: "bg-white rounded-lg shadow p-6",
    });
    const placeholderText = createElement(
      "p",
      { className: "text-gray-500 text-center" },
      "🚧 Under Construction 🚧"
    );
    const features = createElement("ul", {
      className: "mt-4 space-y-2 text-sm text-gray-600",
    });
    features.innerHTML = `
      <li>✅ Real-time messaging</li>
      <li>✅ Channel management</li>
      <li>✅ User presence</li>
      <li>✅ File sharing</li>
      <li>✅ Message history</li>
    `;
    placeholder.appendChild(placeholderText);
    placeholder.appendChild(features);
    container.appendChild(placeholder);

    return container;
  }

  /**
   * Update user information
   */
  setUser(user) {
    this.options.user = user;
    // Re-render with new user data
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  /**
   * Get the page element
   */
  getElement() {
    return this.element;
  }

  /**
   * Clean up
   */
  destroy() {
    // Clean up if needed
  }
}
