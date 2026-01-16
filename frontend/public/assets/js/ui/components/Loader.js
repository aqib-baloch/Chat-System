import { createElement } from "../../utils/dom.js";

/**
 * Loader component for loading states
 */
export class Loader {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      size: "md", // 'sm', 'md', 'lg'
      color: "primary", // 'primary', 'white', 'gray'
      text: "",
      overlay: false, // Show as overlay
      ...options,
    };

    this.render();
  }

  render() {
    const container = this.options.overlay
      ? createElement("div", {
          className:
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
        })
      : createElement("div", {
          className: "flex items-center justify-center p-4",
        });

    const loaderContainer = createElement("div", {
      className: "flex flex-col items-center space-y-2",
    });

    // Spinner
    const spinner = createElement("div", {
      className: `animate-spin rounded-full border-2 border-current border-t-transparent ${this.getSizeClasses()} ${this.getColorClasses()}`,
    });
    loaderContainer.appendChild(spinner);

    // Text
    if (this.options.text) {
      const text = createElement(
        "p",
        {
          className: "text-sm text-gray-600",
        },
        this.options.text
      );
      loaderContainer.appendChild(text);
    }

    container.appendChild(loaderContainer);
    this.element = container;
    return container;
  }

  getSizeClasses() {
    switch (this.options.size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-12 h-12";
      case "md":
      default:
        return "w-8 h-8";
    }
  }

  getColorClasses() {
    switch (this.options.color) {
      case "white":
        return "text-white";
      case "gray":
        return "text-gray-400";
      case "primary":
      default:
        return "text-primary-600";
    }
  }

  /**
   * Show the loader
   */
  show() {
    if (!this.element.parentElement) {
      document.body.appendChild(this.element);
    }
  }

  /**
   * Hide the loader
   */
  hide() {
    if (this.element.parentElement) {
      this.element.remove();
    }
  }

  /**
   * Update loader options
   */
  update(options) {
    const oldElement = this.element;
    this.options = { ...this.options, ...options };
    const newElement = this.render();
    if (oldElement?.parentElement) {
      oldElement.parentElement.replaceChild(newElement, oldElement);
    }
    this.element = newElement;
  }

  /**
   * Get the loader element
   */
  getElement() {
    return this.element;
  }
}

/**
 * Convenience function to create and show a loading overlay
 */
export const showLoadingOverlay = (text = "Loading...") => {
  const loader = new Loader({ overlay: true, text, size: "lg" });
  loader.show();
  return loader;
};
