/**
 * DOM utility functions
 */

/**
 * Query selector wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => {
  return context.querySelector(selector);
};

/**
 * Query selector all wrapper
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList}
 */
export const $$ = (selector, context = document) => {
  return context.querySelectorAll(selector);
};

export const createElement = (tag, attrs = {}, content = "") => {
  const element = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  });

  if (typeof content === "string") {
    element.textContent = content;
  } else if (content instanceof Element) {
    element.appendChild(content);
  }

  return element;
};

export const on = (element, event, handler, options = {}) => {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
};

export const show = (element) => {
  element.style.display = "";
};

/**
 * Hide element
 * @param {Element} element
 */
export const hide = (element) => {
  element.style.display = "none";
};

/**
 * Toggle element visibility
 * @param {Element} element
 */
export const toggle = (element) => {
  if (element.style.display === "none") {
    show(element);
  } else {
    hide(element);
  }
};
