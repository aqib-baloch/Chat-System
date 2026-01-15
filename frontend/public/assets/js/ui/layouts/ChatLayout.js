import { createElement } from "../../utils/dom.js";

export class ChatLayout {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      sidebar: null,
      mainContent: null,
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "h-full flex",
    });

    const sidebarContainer = createElement("div", {
      className: "w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0",
    });

    if (this.options.sidebar) {
      if (typeof this.options.sidebar === "string") {
        sidebarContainer.innerHTML = this.options.sidebar;
      } else if (this.options.sidebar instanceof Element) {
        sidebarContainer.appendChild(this.options.sidebar);
      }
    } else {
      sidebarContainer.innerHTML = `
        <div class="p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Channels</h3>
          <div class="space-y-2">
            <div class="text-sm text-gray-600">No channels yet</div>
          </div>
        </div>
      `;
    }

    const mainContainer = createElement("div", {
      className: "flex-1 flex flex-col min-w-0",
    });

    if (this.options.mainContent) {
      if (typeof this.options.mainContent === "string") {
        mainContainer.innerHTML = this.options.mainContent;
      } else if (this.options.mainContent instanceof Element) {
        mainContainer.appendChild(this.options.mainContent);
      }
    } else {
      mainContainer.innerHTML = `
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Chat</h2>
            <p class="text-gray-600">Select a channel to start chatting</p>
          </div>
        </div>
      `;
    }

    container.appendChild(sidebarContainer);
    container.appendChild(mainContainer);

    this.element = container;
    return container;
  }

  updateSidebar(sidebar) {
    this.options.sidebar = sidebar;
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  updateMainContent(content) {
    this.options.mainContent = content;
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  getElement() {
    return this.element;
  }
}
