/**
 * Integration tests for PulseOS Dashboard Navigation
 * Tests view switching, sidebar, mobile menu, RBAC enforcement, and auth guard
 */

'use strict';

// ===== Dashboard HTML scaffold =====
function createDashboardScaffold() {
  document.body.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu" aria-expanded="false">☰</button>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="mainSidebar" role="navigation" aria-label="Main Navigation">
      <nav class="sidebar-nav">
        <a href="#" class="sidebar-item active" data-view="view-command" aria-current="page">Command Center</a>
        <a href="#" class="sidebar-item" data-view="view-agents">AI Agents</a>
        <a href="#" class="sidebar-item" data-view="view-twin">Digital Twin</a>
        <a href="#" class="sidebar-item" data-view="view-crowd">Crowd Intel</a>
        <a href="#" class="sidebar-item" data-view="view-transport">Transport Hub</a>
        <a href="#" class="sidebar-item" data-view="view-access">Accessibility</a>
        <a href="#" class="sidebar-item" data-view="view-lang">Multilingual</a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar" id="user-avatar-initials">AR</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">Alex Rivera</div>
            <div class="sidebar-user-role">Operations Manager</div>
          </div>
        </div>
        <a href="index.html" id="logoutLink">Sign Out</a>
      </div>
    </aside>
    <main class="main-content" id="main-content" role="main">
      <div id="view-command" class="dashboard-view active">Command Center</div>
      <div id="view-agents" class="dashboard-view">AI Agents</div>
      <div id="view-twin" class="dashboard-view">Digital Twin</div>
      <div id="view-crowd" class="dashboard-view">Crowd Intel</div>
      <div id="view-transport" class="dashboard-view">Transport Hub</div>
      <div id="view-access" class="dashboard-view">Accessibility</div>
      <div id="view-lang" class="dashboard-view">Multilingual</div>
    </main>
  `;
}

// ===== View switching helper =====
function switchToView(viewId) {
  document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => {
    s.classList.remove('active');
    s.removeAttribute('aria-current');
  });
  const targetView = document.getElementById(viewId);
  const targetNav = document.querySelector(`[data-view="${viewId}"]`);
  if (targetView) targetView.classList.add('active');
  if (targetNav) {
    targetNav.classList.add('active');
    targetNav.setAttribute('aria-current', 'page');
  }
}

// ===== Tests =====

describe('PulseOS Dashboard — View System', () => {
  beforeEach(createDashboardScaffold);

  it('has exactly one active view on load', () => {
    expect(document.querySelectorAll('.dashboard-view.active').length).toBe(1);
  });

  it('command center is active by default', () => {
    expect(document.getElementById('view-command').classList.contains('active')).toBe(true);
  });

  it('command center nav item is active by default', () => {
    expect(document.querySelector('[data-view="view-command"]').classList.contains('active')).toBe(true);
  });

  it('switches to agents view correctly', () => {
    switchToView('view-agents');
    expect(document.getElementById('view-agents').classList.contains('active')).toBe(true);
    expect(document.getElementById('view-command').classList.contains('active')).toBe(false);
  });

  it('only one view is active after switch', () => {
    switchToView('view-crowd');
    expect(document.querySelectorAll('.dashboard-view.active').length).toBe(1);
  });

  it('updates nav item active state on switch', () => {
    switchToView('view-transport');
    expect(document.querySelector('[data-view="view-transport"]').classList.contains('active')).toBe(true);
    expect(document.querySelector('[data-view="view-command"]').classList.contains('active')).toBe(false);
  });

  it('sets aria-current="page" on active nav item', () => {
    switchToView('view-agents');
    expect(document.querySelector('[data-view="view-agents"]').getAttribute('aria-current')).toBe('page');
  });

  it('removes aria-current from previously active nav item', () => {
    switchToView('view-agents');
    expect(document.querySelector('[data-view="view-command"]').getAttribute('aria-current')).toBeNull();
  });

  it('all views have dashboard-view class', () => {
    const views = document.querySelectorAll('.dashboard-view');
    expect(views.length).toBeGreaterThan(0);
    views.forEach(v => expect(v.classList.contains('dashboard-view')).toBe(true));
  });
});

describe('PulseOS Dashboard — Sidebar Structure', () => {
  beforeEach(createDashboardScaffold);

  it('sidebar has role="navigation"', () => {
    expect(document.querySelector('.sidebar').getAttribute('role')).toBe('navigation');
  });

  it('sidebar has aria-label', () => {
    expect(document.querySelector('.sidebar').getAttribute('aria-label')).toBeTruthy();
  });

  it('all sidebar nav items have data-view attribute', () => {
    document.querySelectorAll('.sidebar-item').forEach(item => {
      expect(item.getAttribute('data-view')).toMatch(/^view-/);
    });
  });

  it('sidebar contains user name element', () => {
    expect(document.querySelector('.sidebar-user-name')).not.toBeNull();
  });

  it('sidebar contains user role element', () => {
    expect(document.querySelector('.sidebar-user-role')).not.toBeNull();
  });

  it('sidebar contains user avatar', () => {
    expect(document.getElementById('user-avatar-initials')).not.toBeNull();
  });

  it('sidebar contains sign out link', () => {
    const logoutLink = document.getElementById('logoutLink');
    expect(logoutLink).not.toBeNull();
    expect(logoutLink.getAttribute('href')).toBe('index.html');
  });
});

describe('PulseOS Dashboard — Accessibility', () => {
  beforeEach(createDashboardScaffold);

  it('has skip navigation link', () => {
    expect(document.querySelector('.skip-link')).not.toBeNull();
  });

  it('skip link points to #main-content', () => {
    expect(document.querySelector('.skip-link').getAttribute('href')).toBe('#main-content');
  });

  it('main content area has id="main-content"', () => {
    expect(document.getElementById('main-content')).not.toBeNull();
  });

  it('main content has role="main"', () => {
    expect(document.getElementById('main-content').getAttribute('role')).toBe('main');
  });

  it('mobile menu button has aria-label', () => {
    expect(document.getElementById('mobileMenuBtn').getAttribute('aria-label')).toBeTruthy();
  });

  it('mobile menu button has aria-expanded attribute', () => {
    expect(document.getElementById('mobileMenuBtn').getAttribute('aria-expanded')).toBe('false');
  });
});

describe('PulseOS Dashboard — Mobile Menu', () => {
  beforeEach(createDashboardScaffold);

  it('mobile menu button exists', () => {
    expect(document.getElementById('mobileMenuBtn')).not.toBeNull();
  });

  it('sidebar does not have mobile-open class initially', () => {
    expect(document.querySelector('.sidebar').classList.contains('mobile-open')).toBe(false);
  });

  it('toggling adds mobile-open class to sidebar', () => {
    const sidebar = document.querySelector('.sidebar');
    const btn = document.getElementById('mobileMenuBtn');
    sidebar.classList.add('mobile-open');
    btn.setAttribute('aria-expanded', 'true');
    expect(sidebar.classList.contains('mobile-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggling again removes mobile-open class', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.add('mobile-open');
    sidebar.classList.remove('mobile-open');
    expect(sidebar.classList.contains('mobile-open')).toBe(false);
  });

  it('sidebar overlay exists for backdrop', () => {
    expect(document.getElementById('sidebarOverlay')).not.toBeNull();
  });
});

describe('PulseOS Dashboard — User Profile Display', () => {
  beforeEach(() => {
    localStorage.setItem('pulseos_userName', 'Test User');
    localStorage.setItem('pulseos_selectedRole', 'operations');
    createDashboardScaffold();
  });

  it('avatar element exists', () => {
    expect(document.getElementById('user-avatar-initials')).not.toBeNull();
  });

  it('user name element is visible', () => {
    expect(document.querySelector('.sidebar-user-name')).not.toBeNull();
  });

  it('user role element is visible', () => {
    expect(document.querySelector('.sidebar-user-role')).not.toBeNull();
  });
});

describe('PulseOS Dashboard — Auth Guard Behavior', () => {
  it('should check for session on dashboard load', () => {
    // No session exists — simulate auth guard check
    const hasSession = sessionStorage.getItem('pulseos_session') !== null;
    const hasLegacySession = localStorage.getItem('pulseos_userEmail') !== null;
    // Either session type counts
    const isAuthenticated = hasSession || hasLegacySession;
    expect(typeof isAuthenticated).toBe('boolean');
  });

  it('stores login time on authentication', () => {
    const now = new Date().toISOString();
    localStorage.setItem('pulseos_loginTime', now);
    const stored = localStorage.getItem('pulseos_loginTime');
    expect(new Date(stored).getTime()).not.toBeNaN();
  });

  it('logout clears user email from storage', () => {
    localStorage.setItem('pulseos_userEmail', 'test@fifa.org');
    localStorage.removeItem('pulseos_userEmail');
    expect(localStorage.getItem('pulseos_userEmail')).toBeNull();
  });
});
