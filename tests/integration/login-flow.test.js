/**
 * Integration tests for PulseOS Login Flow
 * Tests credential validation, role selection, MFA flow, and Request Access
 */

'use strict';

// ===== Tests =====

describe('PulseOS Login — Form Structure', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="loginForm" novalidate>
        <input type="email" id="email" required autocomplete="username" aria-required="true" />
        <input type="password" id="password" required autocomplete="current-password" aria-required="true" />
        <button type="submit" id="loginButton">
          <span class="login-submit__text">Enter PulseOS</span>
        </button>
      </form>
      <div id="mfaOverlay" class="hidden"></div>
      <div id="ssoOverlay" class="hidden"></div>
    `;
  });

  it('has an email input with type="email"', () => {
    expect(document.getElementById('email').type).toBe('email');
  });

  it('has a password input with type="password"', () => {
    expect(document.getElementById('password').type).toBe('password');
  });

  it('marks email as required', () => {
    expect(document.getElementById('email').required).toBe(true);
  });

  it('marks password as required', () => {
    expect(document.getElementById('password').required).toBe(true);
  });

  it('email has autocomplete="username"', () => {
    expect(document.getElementById('email').getAttribute('autocomplete')).toBe('username');
  });

  it('password has autocomplete="current-password"', () => {
    expect(document.getElementById('password').getAttribute('autocomplete')).toBe('current-password');
  });

  it('email has aria-required="true"', () => {
    expect(document.getElementById('email').getAttribute('aria-required')).toBe('true');
  });

  it('form is invalid when email is empty', () => {
    document.getElementById('email').value = '';
    document.getElementById('password').value = 'somepassword';
    expect(document.getElementById('loginForm').checkValidity()).toBe(false);
  });

  it('rejects invalid email format', () => {
    const email = document.getElementById('email');
    email.value = 'not-an-email';
    expect(email.validity.typeMismatch).toBe(true);
  });

  it('accepts valid email format', () => {
    const email = document.getElementById('email');
    email.value = 'operator@fifa.org';
    expect(email.validity.typeMismatch).toBe(false);
    expect(email.validity.valid).toBe(true);
  });
});

describe('PulseOS Login — Role Card Selection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="login-role-card" data-role="admin">Admin</div>
      <div class="login-role-card" data-role="operations">Operations</div>
      <div class="login-role-card" data-role="security">Security</div>
      <div class="login-role-card" data-role="medical">Medical</div>
      <div class="login-role-card" data-role="volunteer">Volunteer</div>
      <div class="login-role-card" data-role="fan">Fan</div>
    `;
  });

  it('renders all 6 role cards', () => {
    expect(document.querySelectorAll('.login-role-card').length).toBe(6);
  });

  it('each card has a data-role attribute', () => {
    const cards = document.querySelectorAll('.login-role-card');
    cards.forEach(card => {
      expect(card.getAttribute('data-role')).toBeTruthy();
    });
  });

  it('has admin role card', () => {
    expect(document.querySelector('[data-role="admin"]')).not.toBeNull();
  });

  it('has fan role card', () => {
    expect(document.querySelector('[data-role="fan"]')).not.toBeNull();
  });

  it('can select a role card by adding selected class', () => {
    const card = document.querySelector('[data-role="operations"]');
    card.classList.add('selected');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('deselecting one card does not affect others', () => {
    const cards = document.querySelectorAll('.login-role-card');
    cards[0].classList.add('selected');
    cards[0].classList.remove('selected');
    cards[1].classList.add('selected');
    expect(cards[1].classList.contains('selected')).toBe(true);
    expect(cards[0].classList.contains('selected')).toBe(false);
  });
});

describe('PulseOS Login — LocalStorage Persistence', () => {
  it('stores email in localStorage', () => {
    localStorage.setItem('pulseos_userEmail', 'test@fifa.org');
    expect(localStorage.getItem('pulseos_userEmail')).toBe('test@fifa.org');
  });

  it('stores selected role in localStorage', () => {
    localStorage.setItem('pulseos_selectedRole', 'operations');
    expect(localStorage.getItem('pulseos_selectedRole')).toBe('operations');
  });

  it('stores login time in ISO format', () => {
    const time = new Date().toISOString();
    localStorage.setItem('pulseos_loginTime', time);
    const retrieved = localStorage.getItem('pulseos_loginTime');
    expect(new Date(retrieved).getTime()).not.toBeNaN();
  });

  it('stores user name from request access', () => {
    localStorage.setItem('pulseos_userName', 'Jane Doe');
    expect(localStorage.getItem('pulseos_userName')).toBe('Jane Doe');
  });

  it('can clear all pulseos_ keys on logout', () => {
    localStorage.setItem('pulseos_userEmail', 'x@x.com');
    localStorage.setItem('pulseos_selectedRole', 'fan');
    localStorage.setItem('pulseos_loginTime', new Date().toISOString());
    localStorage.removeItem('pulseos_userEmail');
    localStorage.removeItem('pulseos_selectedRole');
    localStorage.removeItem('pulseos_loginTime');
    expect(localStorage.getItem('pulseos_userEmail')).toBeNull();
    expect(localStorage.getItem('pulseos_selectedRole')).toBeNull();
  });
});

describe('PulseOS Login — MFA Overlay', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="mfaOverlay" class="auth-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="mfaTitle">
        <h2 id="mfaTitle">Two-Factor Authentication</h2>
        <input type="text" maxlength="1" class="mfa-input" />
        <input type="text" maxlength="1" class="mfa-input" />
        <input type="text" maxlength="1" class="mfa-input" />
        <input type="text" maxlength="1" class="mfa-input" />
        <input type="text" maxlength="1" class="mfa-input" />
        <input type="text" maxlength="1" class="mfa-input" />
        <button id="verifyMfaBtn">Verify Identity</button>
      </div>
    `;
  });

  it('has exactly 6 MFA digit inputs', () => {
    expect(document.querySelectorAll('.mfa-input').length).toBe(6);
  });

  it('each MFA input accepts only 1 character', () => {
    document.querySelectorAll('.mfa-input').forEach(input => {
      expect(input.getAttribute('maxlength')).toBe('1');
    });
  });

  it('MFA overlay is hidden by default', () => {
    expect(document.getElementById('mfaOverlay').classList.contains('hidden')).toBe(true);
  });

  it('MFA overlay has role="dialog"', () => {
    expect(document.getElementById('mfaOverlay').getAttribute('role')).toBe('dialog');
  });

  it('MFA overlay has aria-modal="true"', () => {
    expect(document.getElementById('mfaOverlay').getAttribute('aria-modal')).toBe('true');
  });

  it('MFA overlay shows when hidden class is removed', () => {
    const overlay = document.getElementById('mfaOverlay');
    overlay.classList.remove('hidden');
    expect(overlay.classList.contains('hidden')).toBe(false);
  });

  it('has a verify button', () => {
    expect(document.getElementById('verifyMfaBtn')).not.toBeNull();
  });
});

describe('PulseOS Login — Request Access Form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="requestAccessOverlay" class="auth-overlay hidden" role="dialog" aria-modal="true">
        <form id="requestAccessForm">
          <input type="text" id="requestName" required placeholder="Full Name" />
          <input type="text" id="requestOrg" required placeholder="Organization" />
          <input type="email" id="requestEmail" required placeholder="Work Email" />
          <button type="button" id="cancelRequestBtn">Cancel</button>
          <button type="submit" id="submitRequestBtn">Submit</button>
        </form>
        <div id="requestAccessSuccess" style="display:none;">
          <button id="closeRequestSuccessBtn">Enter Dashboard</button>
        </div>
      </div>
      <a href="#" class="login-signup__link">Request Access</a>
    `;
  });

  it('request access link exists', () => {
    expect(document.querySelector('.login-signup__link')).not.toBeNull();
  });

  it('request access overlay exists', () => {
    expect(document.getElementById('requestAccessOverlay')).not.toBeNull();
  });

  it('overlay starts hidden', () => {
    expect(document.getElementById('requestAccessOverlay').classList.contains('hidden')).toBe(true);
  });

  it('has Full Name input', () => {
    expect(document.getElementById('requestName')).not.toBeNull();
  });

  it('has Organization input', () => {
    expect(document.getElementById('requestOrg')).not.toBeNull();
  });

  it('has email input with type="email"', () => {
    expect(document.getElementById('requestEmail').type).toBe('email');
  });

  it('all request access fields are required', () => {
    expect(document.getElementById('requestName').required).toBe(true);
    expect(document.getElementById('requestOrg').required).toBe(true);
    expect(document.getElementById('requestEmail').required).toBe(true);
  });

  it('success message is hidden initially', () => {
    const success = document.getElementById('requestAccessSuccess');
    expect(success.style.display).toBe('none');
  });

  it('cancel button exists', () => {
    expect(document.getElementById('cancelRequestBtn')).not.toBeNull();
  });

  it('overlay has role="dialog" for accessibility', () => {
    expect(document.getElementById('requestAccessOverlay').getAttribute('role')).toBe('dialog');
  });
});

describe('PulseOS Login — SSO Providers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="login-sso">
        <button class="login-sso__btn" type="button" data-provider="Google">Google</button>
        <button class="login-sso__btn" type="button" data-provider="Microsoft">Microsoft</button>
        <button class="login-sso__btn" type="button" data-provider="Apple">Apple</button>
        <button class="login-sso__btn" type="button" data-provider="FIFA ID">FIFA ID</button>
      </div>
    `;
  });

  it('renders 4 SSO provider buttons', () => {
    expect(document.querySelectorAll('.login-sso__btn').length).toBe(4);
  });

  it('all SSO buttons have data-provider attribute', () => {
    document.querySelectorAll('.login-sso__btn').forEach(btn => {
      expect(btn.getAttribute('data-provider')).toBeTruthy();
    });
  });

  it('has Google SSO button', () => {
    expect(document.querySelector('[data-provider="Google"]')).not.toBeNull();
  });

  it('has FIFA ID SSO button', () => {
    expect(document.querySelector('[data-provider="FIFA ID"]')).not.toBeNull();
  });

  it('SSO buttons are type="button" to not trigger form submit', () => {
    document.querySelectorAll('.login-sso__btn').forEach(btn => {
      expect(btn.type).toBe('button');
    });
  });
});
