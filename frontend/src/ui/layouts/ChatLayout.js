import { createElement } from "../../utils/dom.js";

export class ChatLayout {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      leftSidebar: null,
      rightSidebar: null,
      mainContent: null,
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "h-[calc(100vh-4rem)] flex min-w-0",
    });

    const leftSidebar = createElement("aside", {
      className: "w-72 bg-white border-r border-gray-200 flex-shrink-0",
    });

    if (this.options.leftSidebar) {
      leftSidebar.appendChild(this.options.leftSidebar);
    }

    const rightSidebar = createElement("aside", {
      className: "w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0",
    });

    if (this.options.rightSidebar) {
      rightSidebar.appendChild(this.options.rightSidebar);
    }

    const main = createElement("main", {
      className: "flex-1 min-w-0 bg-white",
    });

    if (this.options.mainContent) {
      main.appendChild(this.options.mainContent);
    }

    container.appendChild(leftSidebar);
    container.appendChild(rightSidebar);
    container.appendChild(main);

    this.element = container;
    return container;
  }

  update(options) {
    const oldElement = this.element;
    this.options = { ...this.options, ...options };
    const newElement = this.render();
    if (oldElement?.parentElement) {
      oldElement.parentElement.replaceChild(newElement, oldElement);
    }
    this.element = newElement;
  }

  getElement() {
    return this.element;
  }
}
