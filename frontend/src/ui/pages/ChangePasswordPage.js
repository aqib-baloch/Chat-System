import { createElement } from "../../utils/dom.js";
import { validateForm } from "../../utils/validate.js";
import { showError, showSuccess, showLoading, hideLoading } from "../../utils/notify.js";
import { authApi } from "../../services/api/auth.api.js";
import { ROUTES } from "../../config/constants.js";
import { AppShell } from "../layouts/AppShell.js";
import { Button } from "../components/Button.js";
import { Input } from "../components/Input.js";

export class ChangePasswordPage {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      user: null,
      onLogout: null,
      ...options,
    };

    this.formData = {
      current_password: "",
      new_password: "",
      confirmPassword: "",
    };

    this.render();
  }

  render() {
    const content = this.renderContent();

    const shell = new AppShell({
      user: this.options.user,
      onLogout: this.options.onLogout,
      content,
    });

    this.element = shell.getElement();
    return this.element;
  }

  renderContent() {
    const wrap = createElement("div", {
      className: "min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10",
    });

    const card = createElement("div", {
      className: "max-w-md w-full space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm",
    });

    card.appendChild(
      createElement("h2", { className: "text-xl font-semibold text-gray-900" }, "Change password")
    );
    card.appendChild(
      createElement(
        "p",
        { className: "text-sm text-gray-600" },
        "Update your password to keep your account secure."
      )
    );

    const form = createElement("form", { className: "space-y-4" });
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    const currentInput = new Input({
      type: "password",
      label: "Current password",
      placeholder: "Enter your current password",
      required: true,
      onChange: (value) => {
        this.formData.current_password = value;
        currentInput.clearError();
      },
    });
    this.currentInput = currentInput;
    form.appendChild(currentInput.getElement());

    const newInput = new Input({
      type: "password",
      label: "New password",
      placeholder: "Enter a strong password",
      required: true,
      onChange: (value) => {
        this.formData.new_password = value;
        newInput.clearError();
      },
    });
    this.newInput = newInput;
    form.appendChild(newInput.getElement());

    const confirmInput = new Input({
      type: "password",
      label: "Confirm new password",
      placeholder: "Re-enter the new password",
      required: true,
      onChange: (value) => {
        this.formData.confirmPassword = value;
        confirmInput.clearError();
      },
    });
    this.confirmInput = confirmInput;
    form.appendChild(confirmInput.getElement());

    const submitButton = new Button({
      text: "Update password",
      variant: "primary",
      className: "w-full",
      onClick: () => this.handleSubmit(),
    });
    this.submitButton = submitButton;
    form.appendChild(submitButton.getElement());

    const footer = createElement("div", { className: "text-center" });
    footer.innerHTML =
      `Back to <a href="${ROUTES.CHAT}" class="font-medium text-primary-600 hover:text-primary-500">Chat</a>`;

    card.appendChild(form);
    card.appendChild(footer);
    wrap.appendChild(card);
    return wrap;
  }

  async handleSubmit(e) {
    if (e) e.preventDefault();

    this.currentInput.clearError();
    this.newInput.clearError();
    this.confirmInput.clearError();

    const validation = validateForm(this.formData, {
      current_password: [{ type: "required" }],
      new_password: [{ type: "required" }, { type: "password" }],
      confirmPassword: [{ type: "required" }],
    });

    if (!validation.isValid) {
      if (validation.errors.current_password) {
        this.currentInput.setError(validation.errors.current_password.join(", "));
      }
      if (validation.errors.new_password) {
        this.newInput.setError(validation.errors.new_password.join(", "));
      }
      if (validation.errors.confirmPassword) {
        this.confirmInput.setError(validation.errors.confirmPassword.join(", "));
      }
      return;
    }

    if (this.formData.new_password !== this.formData.confirmPassword) {
      this.confirmInput.setError("Passwords do not match");
      return;
    }

    this.submitButton.setDisabled(true);
    showLoading("Updating password...");

    try {
      await authApi.changePassword({
        current_password: this.formData.current_password,
        new_password: this.formData.new_password,
      });
      hideLoading();
      showSuccess("Password updated successfully");
      window.location.hash = ROUTES.CHAT;
    } catch (error) {
      hideLoading();
      this.submitButton.setDisabled(false);
      showError(error.response?.data?.error || "Failed to update password. Please try again.");
    }
  }

  getElement() {
    return this.element;
  }

  destroy() {}
}

