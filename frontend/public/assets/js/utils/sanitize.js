/**
 * HTML sanitization utilities for safe rendering
 */

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text
 * @returns {string}
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize user input for display
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return escapeHtml(input.trim());
};

/**
 * Create safe HTML element with sanitized content
 * @param {string} tag
 * @param {string} content
 * @param {Object} attrs
 * @returns {Element}
 */
export const createSafeElement = (tag, content, attrs = {}) => {
  const element = document.createElement(tag);
  element.textContent = content;

  Object.entries(attrs).forEach(([key, value]) => {
    if (key !== 'innerHTML' && key !== 'textContent') {
      element.setAttribute(key, value);
    }
  });

  return element;
};

/**
 * Sanitize object properties for display
 * @param {Object} obj
 * @param {string[]} allowedKeys
 * @returns {Object}
 */
export const sanitizeObject = (obj, allowedKeys = []) => {
  const sanitized = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (allowedKeys.length === 0 || allowedKeys.includes(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
};