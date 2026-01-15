import { createElement } from "../../utils/dom.js";

export class Input {
  constructor(options = {}) {
    this.element = null;
    this.id = `input-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    this.options = {
      type: "text",
      placeholder: "",
      value: "",
      label: "",
      error: "",
      required: false,
      disabled: false,
      className: "",
      onChange: null,
      onBlur: null,
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", { className: "mb-4" });

    if (this.options.label) {
      const label = createElement(
        "label",
        {
          className: "block text-sm font-medium text-gray-700 mb-1",
          for: this.id,
        },
        this.options.label
      );
      container.appendChild(label);
    }

    const inputWrapper = createElement("div", { className: "relative" });

    const inputClasses = [
      "input-field",
      this.options.error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "",
      this.options.className,
    ]
      .filter(Boolean)
      .join(" ");

    this.element = createElement("input", {
      type: this.options.type,
      placeholder: this.options.placeholder,
      value: this.options.value,
      required: this.options.required,
      disabled: this.options.disabled,
      className: inputClasses,
      id: this.id,
    });

    if (this.options.onChange) {
      this.element.addEventListener("input", (e) =>
        this.options.onChange(e.target.value)
      );
    }
    if (this.options.onBlur) {
      this.element.addEventListener("blur", (e) =>
        this.options.onBlur(e.target.value)
      );
    }

    inputWrapper.appendChild(this.element);
    container.appendChild(inputWrapper);

    if (this.options.error) {
      const errorElement = createElement(
        "p",
        {
          className: "mt-1 text-sm text-red-600",
        },
        this.options.error
      );
      container.appendChild(errorElement);
    }

    this.container = container;
    return container;
  }

  update(options) {
    this.options = { ...this.options, ...options };
    const newContainer = this.render();
    if (this.container.parentElement) {
      this.container.parentElement.replaceChild(newContainer, this.container);
    }
    this.container = newContainer;
    this.element = newContainer.querySelector("input");
  }

  getElement() {
    return this.container;
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
    this.options.value = value;
  }

  setError(error) {
    this.update({ error });
  }

  clearError() {
    this.update({ error: "" });
  }

  focus() {
    this.element.focus();
  }
}
