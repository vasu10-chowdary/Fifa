/* =============================================================
   PulseOS — Input Sanitization Module
   Prevents XSS attacks and validates all user-controlled data
   ============================================================= */

(function () {
  'use strict';

  /**
   * Escapes HTML special characters to prevent XSS in innerHTML contexts.
   * @param {*} str - Input to sanitize
   * @returns {string} HTML-escaped string
   */
  function sanitizeText(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Strips potentially dangerous characters from user input fields.
   * @param {*} str - Raw user input
   * @returns {string} Sanitized input safe for storage and display
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>"'`\\]/g, '');
  }

  /**
   * Validates and sanitizes a URL, blocking dangerous protocols.
   * @param {*} url - URL string to validate
   * @returns {string} Validated URL or '#' if dangerous/invalid
   */
  function sanitizeURL(url) {
    if (typeof url !== 'string') return '#';
    var allowedProtocols = ['http:', 'https:', 'mailto:'];
    try {
      var parsed = new URL(url);
      return allowedProtocols.indexOf(parsed.protocol) !== -1 ? url : '#';
    } catch (e) {
      return '#';
    }
  }

  /**
   * Uses DOM text node to safely encode HTML.
   * More thorough than regex — handles edge cases.
   * @param {*} str - HTML string to escape
   * @returns {string} Safely encoded HTML
   */
  function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Validates an email address format.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  /**
   * Sanitizes an object's string values recursively.
   * @param {Object} obj
   * @returns {Object}
   */
  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return {};
    var result = {};
    Object.keys(obj).forEach(function (key) {
      var val = obj[key];
      if (typeof val === 'string') {
        result[key] = sanitizeInput(val);
      } else if (typeof val === 'object' && val !== null) {
        result[key] = sanitizeObject(val);
      } else {
        result[key] = val;
      }
    });
    return result;
  }

  window.PulseSanitize = {
    sanitizeText: sanitizeText,
    sanitizeInput: sanitizeInput,
    sanitizeURL: sanitizeURL,
    sanitizeHTML: sanitizeHTML,
    isValidEmail: isValidEmail,
    sanitizeObject: sanitizeObject
  };

})();
