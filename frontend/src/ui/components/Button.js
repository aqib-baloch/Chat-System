import { createElement } from "../../utils/dom.js";

/**
 * Button component
 */
export class Button {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      text: "",
      variant: "primary", // 'primary', 'secondary', 'danger'
      size: "md", // 'sm', 'md', 'lg'
      disabled: false,
      onClick: null,
      className: "",
      ...options,
    };

    this.render();
  }

  render() {
    const baseClasses =
      "btn font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center";

    const variantClasses = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const classes = [
      baseClasses,
      variantClasses[this.options.variant],
      sizeClasses[this.options.size],
      this.options.className,
    ]
      .filter(Boolean)
      .join(" ");

    this.element = createElement(
      "button",
      {
        className: classes,
        disabled: this.options.disabled,
        type: "button",
      },
      this.options.text
    );

    if (this.options.onClick) {
      this.element.addEventListener("click", this.options.onClick);
    }

    return this.element;
  }

  /**
   * Update button properties
   */
  update(options) {
    const oldElement = this.element;
    this.options = { ...this.options, ...options };
    // Re-render if needed
    const newElement = this.render();
    if (oldElement?.parentElement) {
      oldElement.parentElement.replaceChild(newElement, oldElement);
    }
    this.element = newElement;
  }

  /**
   * Get the button element
   */
  getElement() {
    return this.element;
  }

  /**
   * Enable/disable button
   */
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
    this.element.classList.toggle("opacity-50", disabled);
    this.element.classList.toggle("cursor-not-allowed", disabled);
  }
}
