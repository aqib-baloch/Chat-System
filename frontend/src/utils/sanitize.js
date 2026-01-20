export const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return "";
  }
  return escapeHtml(input.trim());
};

export const createSafeElement = (tag, content, attrs = {}) => {
  const element = document.createElement(tag);
  element.textContent = content;

  Object.entries(attrs).forEach(([key, value]) => {
    if (key !== "innerHTML" && key !== "textContent") {
      element.setAttribute(key, value);
    }
  });

  return element;
};

export const sanitizeObject = (obj, allowedKeys = []) => {
  const sanitized = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (allowedKeys.length === 0 || allowedKeys.includes(key)) {
      if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
};
