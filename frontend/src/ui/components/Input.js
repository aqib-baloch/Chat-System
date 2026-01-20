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
      required: this.options.required,
      disabled: this.options.disabled,
      className: inputClasses,
      id: this.id,
    });
    this.element.value = this.options.value ?? "";

    if (this.options.onChange) {
      this.element.addEventListener("input", (e) => {
        this.options.value = e.target.value;
        this.options.onChange(e.target.value);
      });
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
    const wasFocused = document.activeElement === this.element;
    const selectionStart = this.element?.selectionStart ?? null;
    const selectionEnd = this.element?.selectionEnd ?? null;

    this.options = { ...this.options, ...options };

    if (this.element) {
      this.element.type = this.options.type;
      this.element.placeholder = this.options.placeholder;
      this.element.required = this.options.required;
      this.element.disabled = this.options.disabled;

      if (options.value !== undefined) {
        this.element.value = options.value;
      }

      const inputClasses = [
        "input-field",
        this.options.error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "",
        this.options.className,
      ]
        .filter(Boolean)
        .join(" ");
      this.element.className = inputClasses;
    }

    const label = this.container.querySelector("label");
    if (label && this.options.label) {
      label.textContent = this.options.label;
    }

    let errorElement = this.container.querySelector(".text-red-600");
    if (this.options.error) {
      if (!errorElement) {
        errorElement = createElement(
          "p",
          {
            className: "mt-1 text-sm text-red-600",
          },
          this.options.error
        );
        this.container.appendChild(errorElement);
      } else {
        errorElement.textContent = this.options.error;
      }
    } else if (errorElement) {
      errorElement.remove();
    }

    if (wasFocused && this.element) {
      this.element.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        try {
          this.element.setSelectionRange(selectionStart, selectionEnd);
        } catch {}
      }
    }
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
