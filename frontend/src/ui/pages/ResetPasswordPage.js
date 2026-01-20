import { createElement } from "../../utils/dom.js";
import { validateForm } from "../../utils/validate.js";
import { showError, showSuccess, showLoading, hideLoading } from "../../utils/notify.js";
import { authApi } from "../../services/api/auth.api.js";
import { ROUTES } from "../../config/constants.js";
import { Button } from "../components/Button.js";
import { Input } from "../components/Input.js";

export class ResetPasswordPage {
  constructor(options = {}) {
    this.element = null;
    this.options = { query: {}, ...options };

    this.formData = { password: "", confirmPassword: "" };

    this.render();
  }

  getToken() {
    const fromHash = this.options.query?.token;
    if (typeof fromHash === "string" && fromHash.trim() !== "") {
      return fromHash.trim();
    }
    const fromSearch = new URLSearchParams(window.location.search).get("token");
    return fromSearch ? fromSearch.trim() : "";
  }

  render() {
    const container = createElement("div", {
      className:
        "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8",
    });
    const card = createElement("div", { className: "max-w-md w-full space-y-8" });

    const header = createElement("div", { className: "text-center" });
    header.appendChild(
      createElement(
        "h2",
        { className: "mt-6 text-3xl font-extrabold text-gray-900" },
        "Reset password"
      )
    );
    header.appendChild(
      createElement(
        "p",
        { className: "mt-2 text-sm text-gray-600" },
        "Choose a new password for your account"
      )
    );
    card.appendChild(header);

    const token = this.getToken();
    if (!token) {
      const warning = createElement(
        "div",
        {
          className:
            "rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800",
        },
        "Missing reset token. Please use the link from your email."
      );
      card.appendChild(warning);
    }

    const form = createElement("form", { className: "mt-8 space-y-6" });
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    const passwordInput = new Input({
      type: "password",
      label: "New password",
      placeholder: "Enter a strong password",
      required: true,
      onChange: (value) => {
        this.formData.password = value;
        passwordInput.clearError();
      },
    });
    this.passwordInput = passwordInput;
    form.appendChild(passwordInput.getElement());

    const confirmInput = new Input({
      type: "password",
      label: "Confirm password",
      placeholder: "Re-enter your password",
      required: true,
      onChange: (value) => {
        this.formData.confirmPassword = value;
        confirmInput.clearError();
      },
    });
    this.confirmInput = confirmInput;
    form.appendChild(confirmInput.getElement());

    const submitButton = new Button({
      text: "Reset password",
      variant: "primary",
      className: "w-full",
      onClick: () => this.handleSubmit(),
    });
    this.submitButton = submitButton;
    form.appendChild(submitButton.getElement());

    const links = createElement("div", { className: "text-center mt-4" });
    const linkText = createElement("p", { className: "text-sm text-gray-600" });
    linkText.innerHTML =
      `Back to <a href="${ROUTES.LOGIN}" class="font-medium text-primary-600 hover:text-primary-500">Sign in</a>`;
    links.appendChild(linkText);
    form.appendChild(links);

    card.appendChild(form);
    container.appendChild(card);

    this.element = container;
    return container;
  }

  async handleSubmit(e) {
    if (e) e.preventDefault();

    this.passwordInput.clearError();
    this.confirmInput.clearError();

    const token = this.getToken();
    if (!token) {
      showError("Missing reset token. Please use the email link.");
      return;
    }

    const validation = validateForm(this.formData, {
      password: [{ type: "required" }, { type: "password" }],
      confirmPassword: [{ type: "required" }],
    });

    if (!validation.isValid) {
      if (validation.errors.password) {
        this.passwordInput.setError(validation.errors.password.join(", "));
      }
      if (validation.errors.confirmPassword) {
        this.confirmInput.setError(validation.errors.confirmPassword.join(", "));
      }
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.confirmInput.setError("Passwords do not match");
      return;
    }

    this.submitButton.setDisabled(true);
    showLoading("Resetting password...");

    try {
      await authApi.resetPassword({ token, password: this.formData.password });
      hideLoading();
      showSuccess("Password reset successfully. Please sign in.");
      window.location.hash = ROUTES.LOGIN;
    } catch (error) {
      hideLoading();
      this.submitButton.setDisabled(false);
      showError(error.response?.data?.error || "Failed to reset password. Please try again.");
    }
  }

  getElement() {
    return this.element;
  }

  destroy() {}
}

