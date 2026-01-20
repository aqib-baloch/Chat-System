let toastContainer = null;

const initToastContainer = () => {
  if (toastContainer) return;

  toastContainer = document.createElement("div");
  toastContainer.className = "fixed top-4 right-4 z-50 space-y-2";
  toastContainer.id = "toast-container";
  document.body.appendChild(toastContainer);
};

export const showToast = (message, type = "info", duration = 3000) => {
  initToastContainer();

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-md shadow-lg max-w-sm animate-slide-in-right ${getToastClasses(
    type
  )}`;

  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-1">${message}</div>
      <button class="ml-4 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
        ×
      </button>
    </div>
  `;

  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }

  return toast;
};

const getToastClasses = (type) => {
  const baseClasses = "text-white";

  switch (type) {
    case "success":
      return `${baseClasses} bg-green-500`;
    case "error":
      return `${baseClasses} bg-red-500`;
    case "warning":
      return `${baseClasses} bg-yellow-500`;
    case "info":
    default:
      return `${baseClasses} bg-blue-500`;
  }
};

export const showSuccess = (message, duration) => {
  return showToast(message, "success", duration);
};

export const showError = (message, duration) => {
  return showToast(message, "error", duration);
};

export const showWarning = (message, duration) => {
  return showToast(message, "warning", duration);
};

export const showInfo = (message, duration) => {
  return showToast(message, "info", duration);
};

export const showLoading = (message = "Loading...") => {
  const loading = document.createElement("div");
  loading.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  loading.id = "loading-overlay";

  loading.innerHTML = `
    <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span class="text-gray-700">${message}</span>
    </div>
  `;

  document.body.appendChild(loading);
  return loading;
};

export const hideLoading = () => {
  const loading = document.getElementById("loading-overlay");
  if (loading) {
    loading.remove();
  }
};
