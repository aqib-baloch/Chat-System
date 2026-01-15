import { createElement } from "../../utils/dom.js";

export class Modal {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      title: "",
      content: "",
      showCloseButton: true,
      size: "md", // 'sm', 'md', 'lg', 'xl'
      onClose: null,
      ...options,
    };

    this.render();
  }

  render() {
    const backdrop = createElement("div", {
      className:
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
    });

    const modal = createElement("div", {
      className: `bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden ${this.getSizeClasses()}`,
    });

    const header = createElement("div", {
      className:
        "flex items-center justify-between p-6 border-b border-gray-200",
    });

    if (this.options.title) {
      const title = createElement(
        "h3",
        {
          className: "text-lg font-semibold text-gray-900",
        },
        this.options.title
      );
      header.appendChild(title);
    }

    if (this.options.showCloseButton) {
      const closeButton = createElement(
        "button",
        {
          className: "text-gray-400 hover:text-gray-600 transition-colors",
          "aria-label": "Close modal",
        },
        "×"
      );
      closeButton.addEventListener("click", () => this.close());
      header.appendChild(closeButton);
    }

    modal.appendChild(header);

    const body = createElement("div", {
      className: "p-6 overflow-y-auto",
    });

    if (typeof this.options.content === "string") {
      body.innerHTML = this.options.content;
    } else if (this.options.content instanceof Element) {
      body.appendChild(this.options.content);
    }

    modal.appendChild(body);

    if (this.options.footer) {
      const footer = createElement("div", {
        className:
          "flex items-center justify-end space-x-3 p-6 border-t border-gray-200",
      });

      if (typeof this.options.footer === "string") {
        footer.innerHTML = this.options.footer;
      } else if (this.options.footer instanceof Element) {
        footer.appendChild(this.options.footer);
      }

      modal.appendChild(footer);
    }

    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
    document.addEventListener("keydown", handleEscape);

    this.element = backdrop;
    this.modal = modal;
    this.handleEscape = handleEscape;

    return backdrop;
  }

  getSizeClasses() {
    const sizes = {
      sm: "max-w-md w-full mx-4",
      md: "max-w-lg w-full mx-4",
      lg: "max-w-2xl w-full mx-4",
      xl: "max-w-4xl w-full mx-4",
    };
    return sizes[this.options.size] || sizes.md;
  }

  show() {
    document.body.appendChild(this.element);
    document.body.style.overflow = "hidden";
  }

  close() {
    if (this.element.parentElement) {
      this.element.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleEscape);

      if (this.options.onClose) {
        this.options.onClose();
      }
    }
  }

  updateContent(content) {
    this.options.content = content;
    const body = this.modal.querySelector(".p-6.overflow-y-auto");
    if (body) {
      body.innerHTML = "";
      if (typeof content === "string") {
        body.innerHTML = content;
      } else if (content instanceof Element) {
        body.appendChild(content);
      }
    }
  }

  getElement() {
    return this.element;
  }
}
