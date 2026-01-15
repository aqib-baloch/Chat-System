import { createElement } from "../../utils/dom.js";

/**
 * Toast component for complex notifications
 */
export class Toast {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      message: "",
      type: "info", // 'success', 'error', 'warning', 'info'
      duration: 3000,
      position: "top-right", // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      showCloseButton: true,
      onClose: null,
      ...options,
    };

    this.render();
  }

  render() {
    const toast = createElement("div", {
      className: `p-4 rounded-md shadow-lg max-w-sm transform transition-all duration-300 ease-in-out ${this.getTypeClasses()} ${this.getAnimationClasses()}`,
    });

    const content = createElement("div", { className: "flex items-start" });

    // Icon
    const icon = createElement("div", { className: "flex-shrink-0" });
    icon.innerHTML = this.getIconHtml();
    content.appendChild(icon);

    // Message
    const messageContainer = createElement("div", { className: "ml-3 flex-1" });
    const message = createElement(
      "p",
      { className: "text-sm font-medium" },
      this.options.message
    );
    messageContainer.appendChild(message);

    // Close button
    if (this.options.showCloseButton) {
      const closeButton = createElement(
        "button",
        {
          className:
            "ml-4 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity",
          "aria-label": "Close toast",
        },
        "×"
      );
      closeButton.addEventListener("click", () => this.close());
      messageContainer.appendChild(closeButton);
    }

    content.appendChild(messageContainer);
    toast.appendChild(content);

    this.element = toast;
    return toast;
  }

  getTypeClasses() {
    const baseClasses = "text-white border-l-4";

    switch (this.options.type) {
      case "success":
        return `${baseClasses} bg-green-500 border-green-600`;
      case "error":
        return `${baseClasses} bg-red-500 border-red-600`;
      case "warning":
        return `${baseClasses} bg-yellow-500 border-yellow-600`;
      case "info":
      default:
        return `${baseClasses} bg-blue-500 border-blue-600`;
    }
  }

  getAnimationClasses() {
    return "animate-slide-in-right";
  }

  getIconHtml() {
    switch (this.options.type) {
      case "success":
        return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
      case "error":
        return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
      case "warning":
        return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
      case "info":
      default:
        return '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }
  }

  /**
   * Show the toast
   */
  show() {
    // Find or create toast container
    let container = document.getElementById("toast-container");
    if (!container) {
      container = createElement("div", {
        id: "toast-container",
        className: `fixed z-50 space-y-2 ${this.getPositionClasses()}`,
      });
      document.body.appendChild(container);
    }

    container.appendChild(this.element);

    // Auto close after duration
    if (this.options.duration > 0) {
      this.timeoutId = setTimeout(() => this.close(), this.options.duration);
    }
  }

  getPositionClasses() {
    switch (this.options.position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-right":
      default:
        return "top-4 right-4";
    }
  }

  /**
   * Close the toast
   */
  close() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.element.classList.add("animate-slide-out-right");
    setTimeout(() => {
      if (this.element.parentElement) {
        this.element.remove();
      }
      if (this.options.onClose) {
        this.options.onClose();
      }
    }, 300);
  }

  /**
   * Get the toast element
   */
  getElement() {
    return this.element;
  }
}
