/* =============================================================
   PulseOS — Content Security Policy (CSP) Helper
   Injects and validates CSP dynamically
   ============================================================= */

(function () {
  'use strict';

  var DEFAULT_CSP = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';";

  /**
   * Initializes CSP dynamically if not present in the HTML.
   * Note: In production, CSP should be delivered via HTTP Headers.
   * This provides a fallback defense-in-depth for the static prototype.
   */
  function init() {
    var existingCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCsp) {
      var meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = DEFAULT_CSP;
      document.head.appendChild(meta);
    }
  }

  /**
   * Validates if a URL is from an allowed origin based on a basic whitelist.
   * @param {string} url 
   * @returns {boolean}
   */
  function validateOrigin(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Relative URLs are considered 'self'
    if (url.startsWith('/')) return true;
    
    var allowedOrigins = [
      window.location.origin,
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    try {
      var parsed = new URL(url);
      return allowedOrigins.indexOf(parsed.origin) !== -1;
    } catch (e) {
      return false; // Invalid URL
    }
  }

  window.PulseCSP = {
    init: init,
    validateOrigin: validateOrigin,
    policy: DEFAULT_CSP
  };

  // Auto-init on load
  init();

})();
