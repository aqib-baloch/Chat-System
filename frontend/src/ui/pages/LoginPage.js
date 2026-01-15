import { createElement } from "../../utils/dom.js";
import { validateForm } from "../../utils/validate.js";
import {
  showError,
  showSuccess,
  showLoading,
  hideLoading,
} from "../../utils/notify.js";
import { authApi } from "../../services/api/auth.api.js";
import { Button } from "../components/Button.js";
import { Input } from "../components/Input.js";

/**
 * Login Page Component
 */
export class LoginPage {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      onLoginSuccess: null,
      ...options,
    };

    this.formData = {
      email: "",
      password: "",
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className:
        "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8",
    });
    const card = createElement("div", {
      className: "max-w-md w-full space-y-8",
    });

    // Header
    const header = createElement("div", { className: "text-center" });
    const title = createElement(
      "h2",
      { className: "mt-6 text-3xl font-extrabold text-gray-900" },
      "Sign in to your account"
    );
    const subtitle = createElement(
      "p",
      { className: "mt-2 text-sm text-gray-600" },
      "Welcome back to the Chat System"
    );
    header.appendChild(title);
    header.appendChild(subtitle);
    card.appendChild(header);

    // Form
    const form = createElement("form", { className: "mt-8 space-y-6" });
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Email input
    const emailInput = new Input({
      type: "email",
      label: "Email address",
      placeholder: "Enter your email",
      required: true,
      onChange: (value) => {
        this.formData.email = value;
        emailInput.clearError();
      },
    });
    this.emailInput = emailInput;
    form.appendChild(emailInput.getElement());

    // Password input
    const passwordInput = new Input({
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      required: true,
      onChange: (value) => {
        this.formData.password = value;
        passwordInput.clearError();
      },
    });
    this.passwordInput = passwordInput;
    form.appendChild(passwordInput.getElement());

    // Submit button
    const submitButton = new Button({
      text: "Sign in",
      variant: "primary",
      className: "w-full",
      onClick: () => this.handleSubmit(),
    });
    this.submitButton = submitButton;
    form.appendChild(submitButton.getElement());

    // Register link
    const registerLink = createElement("div", {
      className: "text-center mt-4",
    });
    const registerText = createElement("p", {
      className: "text-sm text-gray-600",
    });
    registerText.innerHTML =
      'Don\'t have an account? <a href="#/register" class="font-medium text-primary-600 hover:text-primary-500">Sign up</a>';
    registerLink.appendChild(registerText);
    form.appendChild(registerLink);

    card.appendChild(form);
    container.appendChild(card);

    this.element = container;
    return container;
  }

  async handleSubmit(e) {
    if (e) e.preventDefault();

    // Clear previous errors
    this.emailInput.clearError();
    this.passwordInput.clearError();

    // Validate form
    const validationRules = {
      email: [{ type: "required" }, { type: "email" }],
      password: [{ type: "required" }],
    };

    const validation = validateForm(this.formData, validationRules);

    if (!validation.isValid) {
      // Show validation errors
      Object.entries(validation.errors).forEach(([field, errors]) => {
        const errorMessage = errors.join(", ");
        if (field === "email") {
          this.emailInput.setError(errorMessage);
        } else if (field === "password") {
          this.passwordInput.setError(errorMessage);
        }
      });
      return;
    }

    // Show loading
    this.submitButton.setDisabled(true);
    const loading = showLoading("Signing in...");

    try {
      const response = await authApi.login(this.formData);

      hideLoading();
      showSuccess("Login successful!");

      // Call success callback
      if (this.options.onLoginSuccess) {
        this.options.onLoginSuccess(response);
      }
    } catch (error) {
      hideLoading();
      this.submitButton.setDisabled(false);

      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      showError(errorMessage);

      // Handle specific validation errors
      if (error.response?.status === 422 && error.response.data?.errors) {
        Object.entries(error.response.data.errors).forEach(
          ([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            if (field === "email") {
              this.emailInput.setError(message);
            } else if (field === "password") {
              this.passwordInput.setError(message);
            }
          }
        );
      }
    }
  }

  /**
   * Get the page element
   */
  getElement() {
    return this.element;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    // Clean up if needed
  }
}
