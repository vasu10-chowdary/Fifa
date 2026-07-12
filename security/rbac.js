/* =============================================================
   PulseOS — Role-Based Access Control (RBAC) Module
   Enforces permissions based on user role
   ============================================================= */

(function () {
  'use strict';

  var ROLES = {
    ADMIN: 'admin',
    OPERATIONS: 'operations',
    SECURITY: 'security',
    MEDICAL: 'medical',
    VOLUNTEER: 'volunteer',
    FAN: 'fan'
  };

  // All view IDs match the actual HTML element IDs in dashboard.html
  var ALL_VIEWS = [
    'view-command', 'view-agents', 'view-twin', 'view-crowd',
    'view-transport', 'view-access', 'view-lang',
    'view-sustain', 'view-emergency', 'view-analytics',
    'view-timeline', 'view-executive'
  ];

  var ROLE_VIEWS = {
    'admin':      ALL_VIEWS,   // Admin sees everything
    'operations': [
      'view-command', 'view-agents', 'view-twin', 'view-crowd',
      'view-transport', 'view-access', 'view-lang',
      'view-sustain', 'view-emergency', 'view-analytics',
      'view-timeline', 'view-executive'
    ],
    'security': [
      'view-command', 'view-crowd', 'view-emergency', 'view-analytics', 'view-timeline'
    ],
    'medical': [
      'view-command', 'view-emergency', 'view-analytics'
    ],
    'volunteer': [
      'view-command', 'view-agents', 'view-access', 'view-lang'
    ],
    'fan': [
      'view-command', 'view-access', 'view-lang', 'view-transport'
    ]
  };

  /**
   * Checks if a role string is valid.
   * @param {string} role
   * @returns {boolean}
   */
  function isValidRole(role) {
    return Object.values(ROLES).indexOf(role) !== -1;
  }

  /**
   * Checks if a given role has access to a specific view.
   * @param {string} role
   * @param {string} viewId
   * @returns {boolean}
   */
  function canAccessView(role, viewId) {
    var views = ROLE_VIEWS[role] || ROLE_VIEWS['operations'];
    return views.indexOf(viewId) !== -1;
  }

  /**
   * Gets all views accessible by a role.
   * @param {string} role
   * @returns {Array<string>}
   */
  function getViewsForRole(role) {
    return ROLE_VIEWS[role] || ROLE_VIEWS['operations'];
  }

  /**
   * Enforces RBAC on the current dashboard page.
   * Reads role from localStorage first, then session, then defaults to 'operations'.
   */
  function enforceDashboard() {
    // Check localStorage first (set by login.js on form submit)
    var role = localStorage.getItem('pulseos_selectedRole') || 'operations';

    // Upgrade to session role if available (more authoritative)
    if (window.PulseAuth) {
      var session = window.PulseAuth.getSession();
      if (session && session.user && session.user.role && isValidRole(session.user.role)) {
        role = session.user.role;
      }
    }

    // Final validation fallback
    if (!isValidRole(role)) {
      role = 'operations';
    }

    var allowedViews = getViewsForRole(role);

    // Show/hide sidebar navigation items
    var navItems = document.querySelectorAll('.sidebar-item[data-view]');
    navItems.forEach(function (item) {
      var viewId = item.getAttribute('data-view');
      item.style.display = (allowedViews.indexOf(viewId) !== -1) ? '' : 'none';
    });

    // If the current active view is now hidden, switch to the first allowed view
    var activeView = document.querySelector('.dashboard-view.active');
    if (activeView && allowedViews.indexOf(activeView.id) === -1) {
      // Find first visible nav item and click it
      for (var i = 0; i < navItems.length; i++) {
        if (navItems[i].style.display !== 'none') {
          navItems[i].click();
          break;
        }
      }
    }
  }

  window.PulseRBAC = {
    ROLES: ROLES,
    ALL_VIEWS: ALL_VIEWS,
    isValidRole: isValidRole,
    canAccessView: canAccessView,
    getViewsForRole: getViewsForRole,
    enforceDashboard: enforceDashboard
  };

})();
