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
 * Register Page Component
 */
export class RegisterPage {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      onRegisterSuccess: null,
      ...options,
    };

    this.formData = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
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
      "Create your account"
    );
    const subtitle = createElement(
      "p",
      { className: "mt-2 text-sm text-gray-600" },
      "Join the Chat System"
    );
    header.appendChild(title);
    header.appendChild(subtitle);
    card.appendChild(header);

    // Form
    const form = createElement("form", { className: "mt-8 space-y-6" });
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Name input
    const nameInput = new Input({
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      onChange: (value) => {
        this.formData.name = value;
        nameInput.clearError();
      },
    });
    this.nameInput = nameInput;
    form.appendChild(nameInput.getElement());

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
      placeholder: "Create a password",
      required: true,
      onChange: (value) => {
        this.formData.password = value;
        passwordInput.clearError();
        this.validatePasswordMatch();
      },
    });
    this.passwordInput = passwordInput;
    form.appendChild(passwordInput.getElement());

    // Confirm Password input
    const confirmPasswordInput = new Input({
      type: "password",
      label: "Confirm Password",
      placeholder: "Confirm your password",
      required: true,
      onChange: (value) => {
        this.formData.confirmPassword = value;
        confirmPasswordInput.clearError();
        this.validatePasswordMatch();
      },
    });
    this.confirmPasswordInput = confirmPasswordInput;
    form.appendChild(confirmPasswordInput.getElement());

    // Submit button
    const submitButton = new Button({
      text: "Create Account",
      variant: "primary",
      className: "w-full",
      onClick: () => this.handleSubmit(),
    });
    this.submitButton = submitButton;
    form.appendChild(submitButton.getElement());

    // Login link
    const loginLink = createElement("div", { className: "text-center mt-4" });
    const loginText = createElement("p", {
      className: "text-sm text-gray-600",
    });
    loginText.innerHTML =
      'Already have an account? <a href="#/login" class="font-medium text-primary-600 hover:text-primary-500">Sign in</a>';
    loginLink.appendChild(loginText);
    form.appendChild(loginLink);

    card.appendChild(form);
    container.appendChild(card);

    this.element = container;
    return container;
  }

  validatePasswordMatch() {
    if (this.formData.password && this.formData.confirmPassword) {
      if (this.formData.password !== this.formData.confirmPassword) {
        this.confirmPasswordInput.setError("Passwords do not match");
      } else {
        this.confirmPasswordInput.clearError();
      }
    }
  }

  async handleSubmit(e) {
    if (e) e.preventDefault();

    // Clear previous errors
    this.nameInput.clearError();
    this.emailInput.clearError();
    this.passwordInput.clearError();
    this.confirmPasswordInput.clearError();

    // Validate form
    const validationRules = {
      name: [{ type: "required" }, { type: "name" }],
      email: [{ type: "required" }, { type: "email" }],
      password: [{ type: "required" }, { type: "password" }],
      confirmPassword: [{ type: "required" }],
    };

    const validation = validateForm(this.formData, validationRules);

    // Additional password match validation
    if (this.formData.password !== this.formData.confirmPassword) {
      validation.isValid = false;
      validation.errors.confirmPassword = ["Passwords do not match"];
    }

    if (!validation.isValid) {
      // Show validation errors
      Object.entries(validation.errors).forEach(([field, errors]) => {
        const errorMessage = errors.join(", ");
        switch (field) {
          case "name":
            this.nameInput.setError(errorMessage);
            break;
          case "email":
            this.emailInput.setError(errorMessage);
            break;
          case "password":
            this.passwordInput.setError(errorMessage);
            break;
          case "confirmPassword":
            this.confirmPasswordInput.setError(errorMessage);
            break;
        }
      });
      return;
    }

    // Show loading
    this.submitButton.setDisabled(true);
    const loading = showLoading("Creating account...");

    try {
      const response = await authApi.register({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
      });

      hideLoading();
      showSuccess("Account created successfully! You can now sign in.");

      // Redirect to login
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 2000);
    } catch (error) {
      hideLoading();
      this.submitButton.setDisabled(false);

      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      showError(errorMessage);

      // Handle specific validation errors
      if (error.response?.status === 422 && error.response.data?.errors) {
        Object.entries(error.response.data.errors).forEach(
          ([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            switch (field) {
              case "name":
                this.nameInput.setError(message);
                break;
              case "email":
                this.emailInput.setError(message);
                break;
              case "password":
                this.passwordInput.setError(message);
                break;
            }
          }
        );
      } else if (error.response?.status === 409) {
        this.emailInput.setError("This email is already registered");
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
