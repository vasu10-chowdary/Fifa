/**
 * Unit tests for PulseOS Authentication & Session Management
 * Tests token generation, session lifecycle, CSRF, and audit logging
 */

'use strict';

// ===== Inline auth logic (mirrors security/auth.js) =====

function generateToken() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateCSRFToken() {
  return generateToken();
}

function createSession(userData, storage) {
  storage = storage || sessionStorage;
  const token = generateToken();
  const session = {
    token,
    user: userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + (60 * 60 * 1000)
  };
  storage.setItem('pulseos_session', JSON.stringify(session));
  const csrf = generateCSRFToken();
  storage.setItem('pulseos_csrf', csrf);
  return session;
}

function getSession(storage) {
  storage = storage || sessionStorage;
  const raw = storage.getItem('pulseos_session');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function validateSession(storage) {
  storage = storage || sessionStorage;
  const session = getSession(storage);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    storage.removeItem('pulseos_session');
    return false;
  }
  return true;
}

function destroySession(storage) {
  storage = storage || sessionStorage;
  storage.removeItem('pulseos_session');
  storage.removeItem('pulseos_csrf');
  storage.removeItem('pulseos_audit_log');
}

function auditLog(action, details, storage) {
  storage = storage || sessionStorage;
  const MAX_ENTRIES = 100;
  const raw = storage.getItem('pulseos_audit_log');
  const log = raw ? JSON.parse(raw) : [];
  log.unshift({ action, details: details || {}, timestamp: new Date().toISOString() });
  if (log.length > MAX_ENTRIES) log.splice(MAX_ENTRIES);
  storage.setItem('pulseos_audit_log', JSON.stringify(log));
}

function getAuditLog(storage) {
  storage = storage || sessionStorage;
  const raw = storage.getItem('pulseos_audit_log');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// ===== Shared mock storage factory =====
function makeMockStorage() {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
}

// ===== Tests =====

describe('PulseOS Auth — Token Generation', () => {
  it('generates a 64-character hex token (32 bytes)', () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
  });

  it('generates only valid hex characters', () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique tokens each call', () => {
    const tokens = new Set(Array.from({ length: 50 }, generateToken));
    expect(tokens.size).toBe(50);
  });

  it('generateCSRFToken returns 64-char hex string', () => {
    const csrf = generateCSRFToken();
    expect(csrf).toHaveLength(64);
    expect(csrf).toMatch(/^[0-9a-f]+$/);
  });
});

describe('PulseOS Auth — Session Creation', () => {
  let store;

  beforeEach(() => { store = makeMockStorage(); });

  it('creates session with user data', () => {
    const user = { email: 'admin@fifa.org', role: 'admin' };
    const session = createSession(user, store);
    expect(session.user).toEqual(user);
  });

  it('includes a token in the session', () => {
    const session = createSession({ email: 'test@fifa.org', role: 'fan' }, store);
    expect(session.token).toHaveLength(64);
  });

  it('sets createdAt to approximately now', () => {
    const before = Date.now();
    const session = createSession({ email: 'test@fifa.org', role: 'operations' }, store);
    const after = Date.now();
    expect(session.createdAt).toBeGreaterThanOrEqual(before);
    expect(session.createdAt).toBeLessThanOrEqual(after);
  });

  it('sets expiresAt 1 hour in the future', () => {
    const session = createSession({ email: 'test@fifa.org', role: 'security' }, store);
    const oneHour = 60 * 60 * 1000;
    expect(session.expiresAt - session.createdAt).toBeCloseTo(oneHour, -3);
  });

  it('persists session to storage', () => {
    createSession({ email: 'persist@fifa.org', role: 'medical' }, store);
    expect(store.getItem('pulseos_session')).not.toBeNull();
  });

  it('also stores a CSRF token in storage', () => {
    createSession({ email: 'csrf@fifa.org', role: 'volunteer' }, store);
    const csrf = store.getItem('pulseos_csrf');
    expect(csrf).toHaveLength(64);
  });
});

describe('PulseOS Auth — Session Retrieval', () => {
  let store;

  beforeEach(() => { store = makeMockStorage(); });

  it('retrieves a valid session', () => {
    const user = { email: 'retrieve@fifa.org', role: 'operations' };
    createSession(user, store);
    const session = getSession(store);
    expect(session).not.toBeNull();
    expect(session.user.email).toBe('retrieve@fifa.org');
  });

  it('returns null when no session exists', () => {
    expect(getSession(store)).toBeNull();
  });

  it('returns null for corrupted session JSON', () => {
    store.setItem('pulseos_session', 'INVALID_JSON{{');
    expect(getSession(store)).toBeNull();
  });
});

describe('PulseOS Auth — Session Validation', () => {
  let store;

  beforeEach(() => { store = makeMockStorage(); });

  it('validates a fresh session as true', () => {
    createSession({ email: 'valid@fifa.org', role: 'admin' }, store);
    expect(validateSession(store)).toBe(true);
  });

  it('returns false when no session exists', () => {
    expect(validateSession(store)).toBe(false);
  });

  it('returns false for an expired session', () => {
    const expiredSession = {
      token: 'abc123',
      user: { email: 'expired@fifa.org', role: 'fan' },
      createdAt: Date.now() - (2 * 60 * 60 * 1000),
      expiresAt: Date.now() - (60 * 60 * 1000) // expired 1hr ago
    };
    store.setItem('pulseos_session', JSON.stringify(expiredSession));
    expect(validateSession(store)).toBe(false);
  });

  it('removes expired session from storage', () => {
    const expiredSession = {
      token: 'abc',
      user: { email: 'e@f.com', role: 'fan' },
      createdAt: Date.now() - 7200000,
      expiresAt: Date.now() - 3600000
    };
    store.setItem('pulseos_session', JSON.stringify(expiredSession));
    validateSession(store);
    expect(store.getItem('pulseos_session')).toBeNull();
  });
});

describe('PulseOS Auth — Session Destruction', () => {
  let store;

  beforeEach(() => { store = makeMockStorage(); });

  it('removes session from storage', () => {
    createSession({ email: 'destroy@fifa.org', role: 'admin' }, store);
    destroySession(store);
    expect(store.getItem('pulseos_session')).toBeNull();
  });

  it('removes CSRF token from storage', () => {
    createSession({ email: 'destroy@fifa.org', role: 'admin' }, store);
    destroySession(store);
    expect(store.getItem('pulseos_csrf')).toBeNull();
  });

  it('removes audit log from storage', () => {
    auditLog('LOGIN', {}, store);
    destroySession(store);
    expect(store.getItem('pulseos_audit_log')).toBeNull();
  });
});

describe('PulseOS Auth — Audit Logging', () => {
  let store;

  beforeEach(() => { store = makeMockStorage(); });

  it('writes an audit log entry', () => {
    auditLog('LOGIN', { email: 'test@fifa.org' }, store);
    const log = getAuditLog(store);
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('LOGIN');
  });

  it('stores details in log entry', () => {
    auditLog('VIEW_CHANGE', { from: 'view-command', to: 'view-crowd' }, store);
    const log = getAuditLog(store);
    expect(log[0].details.from).toBe('view-command');
    expect(log[0].details.to).toBe('view-crowd');
  });

  it('prepends entries (most recent first)', () => {
    auditLog('FIRST', {}, store);
    auditLog('SECOND', {}, store);
    const log = getAuditLog(store);
    expect(log[0].action).toBe('SECOND');
    expect(log[1].action).toBe('FIRST');
  });

  it('includes a valid ISO timestamp', () => {
    auditLog('TEST_ACTION', {}, store);
    const log = getAuditLog(store);
    expect(new Date(log[0].timestamp).getTime()).not.toBeNaN();
  });

  it('caps log at 100 entries', () => {
    for (let i = 0; i < 120; i++) {
      auditLog(`ACTION_${i}`, {}, store);
    }
    expect(getAuditLog(store).length).toBe(100);
  });

  it('returns empty array when no log exists', () => {
    expect(getAuditLog(store)).toEqual([]);
  });

  it('handles corrupted log gracefully', () => {
    store.setItem('pulseos_audit_log', 'NOT_JSON{{');
    expect(getAuditLog(store)).toEqual([]);
  });
});
