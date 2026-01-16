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

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string|Element} content - Text content or child element
 * @returns {Element}
 */
export const createElement = (tag, attrs = {}, content = "") => {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  });

  // Set content
  if (typeof content === "string") {
    element.textContent = content;
  } else if (content instanceof Element) {
    element.appendChild(content);
  }

  return element;
};

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 * @returns {Function} Cleanup function
 */
export const on = (element, event, handler, options = {}) => {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
};

/**
 * Show element
 * @param {Element} element
 */
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
