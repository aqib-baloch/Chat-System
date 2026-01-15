import { createElement } from "../../utils/dom.js";

export class AppShell {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      title: "Chat System",
      user: null,
      onLogout: null,
      content: "",
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "min-h-screen bg-gray-50",
    });

    const navbar = createElement("nav", {
      className: "bg-white shadow-sm border-b border-gray-200",
    });
    const navContainer = createElement("div", {
      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    });
    const navContent = createElement("div", {
      className: "flex justify-between h-16",
    });

    const logoContainer = createElement("div", {
      className: "flex items-center",
    });
    const logo = createElement(
      "h1",
      { className: "text-xl font-semibold text-gray-900" },
      this.options.title
    );
    logoContainer.appendChild(logo);
    navContent.appendChild(logoContainer);

    if (this.options.user) {
      const userMenu = createElement("div", {
        className: "flex items-center space-x-4",
      });

      const userInfo = createElement("div", {
        className: "flex items-center space-x-2",
      });
      const avatar = createElement("div", {
        className:
          "w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium",
      });
      avatar.textContent = this.options.user.name.charAt(0).toUpperCase();
      userInfo.appendChild(avatar);

      const userDetails = createElement("div", {
        className: "hidden sm:block",
      });
      const userName = createElement(
        "p",
        { className: "text-sm font-medium text-gray-900" },
        this.options.user.name
      );
      const userEmail = createElement(
        "p",
        { className: "text-xs text-gray-500" },
        this.options.user.email
      );
      userDetails.appendChild(userName);
      userDetails.appendChild(userEmail);
      userInfo.appendChild(userDetails);

      userMenu.appendChild(userInfo);

      const logoutBtn = createElement(
        "button",
        {
          className: "btn btn-secondary text-sm",
          onclick: () => this.options.onLogout && this.options.onLogout(),
        },
        "Logout"
      );
      userMenu.appendChild(logoutBtn);

      navContent.appendChild(userMenu);
    }

    navContainer.appendChild(navContent);
    navbar.appendChild(navContainer);
    container.appendChild(navbar);

    // Main content
    const main = createElement("main", {
      className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",
    });
    const contentContainer = createElement("div", {
      className: "px-4 py-6 sm:px-0",
    });

    if (typeof this.options.content === "string") {
      contentContainer.innerHTML = this.options.content;
    } else if (this.options.content instanceof Element) {
      contentContainer.appendChild(this.options.content);
    }

    main.appendChild(contentContainer);
    container.appendChild(main);

    this.element = container;
    return container;
  }

  /**
   * Update the app shell
   */
  update(options) {
    this.options = { ...this.options, ...options };
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  /**
   * Set the main content
   */
  setContent(content) {
    this.update({ content });
  }

  /**
   * Update user information
   */
  setUser(user) {
    this.update({ user });
  }

  /**
   * Get the app shell element
   */
  getElement() {
    return this.element;
  }
}
