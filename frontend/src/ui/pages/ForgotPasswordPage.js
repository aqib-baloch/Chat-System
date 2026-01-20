import { createElement } from "../../utils/dom.js";
import { validateForm } from "../../utils/validate.js";
import { showError, showSuccess, showLoading, hideLoading } from "../../utils/notify.js";
import { authApi } from "../../services/api/auth.api.js";
import { ROUTES } from "../../config/constants.js";
import { Button } from "../components/Button.js";
import { Input } from "../components/Input.js";

export class ForgotPasswordPage {
  constructor(options = {}) {
    this.element = null;
    this.options = { ...options };

    this.formData = { email: "" };

    this.render();
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
        "Forgot password"
      )
    );
    header.appendChild(
      createElement(
        "p",
        { className: "mt-2 text-sm text-gray-600" },
        "Enter your email and we’ll send you a reset link"
      )
    );
    card.appendChild(header);

    const form = createElement("form", { className: "mt-8 space-y-6" });
    form.addEventListener("submit", (e) => this.handleSubmit(e));

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

    const submitButton = new Button({
      text: "Send reset link",
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

    this.emailInput.clearError();

    const validation = validateForm(this.formData, {
      email: [{ type: "required" }, { type: "email" }],
    });

    if (!validation.isValid) {
      const errors = validation.errors.email || [];
      this.emailInput.setError(errors.join(", "));
      return;
    }

    this.submitButton.setDisabled(true);
    showLoading("Sending reset link...");

    try {
      await authApi.forgotPassword(this.formData.email);
      hideLoading();
      showSuccess("If the email exists, a reset link has been sent.");
      window.location.hash = ROUTES.LOGIN;
    } catch (error) {
      hideLoading();
      this.submitButton.setDisabled(false);
      showError(error.response?.data?.error || "Failed to send reset link. Please try again.");
    }
  }

  getElement() {
    return this.element;
  }

  destroy() {}
}

