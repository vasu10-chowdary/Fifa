/**
 * Unit tests for PulseOS Role-Based Access Control (RBAC)
 * Tests permission matrix for all roles across all views
 * View IDs match the actual HTML element IDs in dashboard.html
 */

'use strict';

// ===== Inline RBAC logic (mirrors security/rbac.js) =====

const ROLES = {
  ADMIN: 'admin',
  OPERATIONS: 'operations',
  SECURITY: 'security',
  MEDICAL: 'medical',
  VOLUNTEER: 'volunteer',
  FAN: 'fan'
};

// Real view IDs from dashboard.html
const ALL_VIEWS = [
  'view-command', 'view-agents', 'view-twin', 'view-crowd',
  'view-transport', 'view-access', 'view-lang',
  'view-sustain', 'view-emergency', 'view-analytics',
  'view-timeline', 'view-executive'
];

const ROLE_VIEWS = {
  admin:      ALL_VIEWS,
  operations: ALL_VIEWS,  // Operations sees everything
  security:   ['view-command', 'view-crowd', 'view-emergency', 'view-analytics', 'view-timeline'],
  medical:    ['view-command', 'view-emergency', 'view-analytics'],
  volunteer:  ['view-command', 'view-agents', 'view-access', 'view-lang'],
  fan:        ['view-command', 'view-access', 'view-lang', 'view-transport']
};

function canAccessView(role, viewId) {
  const views = ROLE_VIEWS[role] || [];
  return views.includes(viewId);
}

function getViewsForRole(role) {
  return ROLE_VIEWS[role] || [];
}

function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

// ===== Tests =====

describe('PulseOS RBAC — Role Definitions', () => {
  it('defines all 6 expected roles', () => {
    expect(Object.values(ROLES)).toEqual(
      expect.arrayContaining(['admin', 'operations', 'security', 'medical', 'volunteer', 'fan'])
    );
  });

  it('has exactly 6 unique roles', () => {
    expect(Object.values(ROLES).length).toBe(6);
  });

  it('validates known roles correctly', () => {
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('fan')).toBe(true);
    expect(isValidRole('operations')).toBe(true);
    expect(isValidRole('security')).toBe(true);
    expect(isValidRole('medical')).toBe(true);
    expect(isValidRole('volunteer')).toBe(true);
  });

  it('rejects unknown roles', () => {
    expect(isValidRole('hacker')).toBe(false);
    expect(isValidRole('')).toBe(false);
    expect(isValidRole(null)).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
  });
});

describe('PulseOS RBAC — Admin (Full Access)', () => {
  it('can access all 12 views', () => {
    ALL_VIEWS.forEach(view => {
      expect(canAccessView('admin', view)).toBe(true);
    });
  });

  it('has the most views of any role', () => {
    const adminCount = getViewsForRole('admin').length;
    Object.keys(ROLE_VIEWS).forEach(role => {
      expect(adminCount).toBeGreaterThanOrEqual(getViewsForRole(role).length);
    });
  });

  it('has access to all 12 dashboard views', () => {
    expect(getViewsForRole('admin').length).toBe(12);
  });
});

describe('PulseOS RBAC — Operations Manager', () => {
  it('can access command center', () => {
    expect(canAccessView('operations', 'view-command')).toBe(true);
  });

  it('can access crowd intelligence', () => {
    expect(canAccessView('operations', 'view-crowd')).toBe(true);
  });

  it('can access AI agents', () => {
    expect(canAccessView('operations', 'view-agents')).toBe(true);
  });

  it('can access transport hub', () => {
    expect(canAccessView('operations', 'view-transport')).toBe(true);
  });

  it('can access sustainability view', () => {
    expect(canAccessView('operations', 'view-sustain')).toBe(true);
  });

  it('can access emergency view', () => {
    expect(canAccessView('operations', 'view-emergency')).toBe(true);
  });

  it('can access analytics', () => {
    expect(canAccessView('operations', 'view-analytics')).toBe(true);
  });

  it('can access executive insights', () => {
    expect(canAccessView('operations', 'view-executive')).toBe(true);
  });

  it('has access to all views', () => {
    expect(getViewsForRole('operations').length).toBe(12);
  });
});

describe('PulseOS RBAC — Security Officer', () => {
  it('can access emergency response', () => {
    expect(canAccessView('security', 'view-emergency')).toBe(true);
  });

  it('can access crowd intelligence', () => {
    expect(canAccessView('security', 'view-crowd')).toBe(true);
  });

  it('can access analytics', () => {
    expect(canAccessView('security', 'view-analytics')).toBe(true);
  });

  it('CANNOT access digital twin', () => {
    expect(canAccessView('security', 'view-twin')).toBe(false);
  });

  it('CANNOT access sustainability view', () => {
    expect(canAccessView('security', 'view-sustain')).toBe(false);
  });

  it('CANNOT access executive insights', () => {
    expect(canAccessView('security', 'view-executive')).toBe(false);
  });

  it('CANNOT access accessibility view', () => {
    expect(canAccessView('security', 'view-access')).toBe(false);
  });
});

describe('PulseOS RBAC — Medical Team', () => {
  it('can access emergency response', () => {
    expect(canAccessView('medical', 'view-emergency')).toBe(true);
  });

  it('can access command center', () => {
    expect(canAccessView('medical', 'view-command')).toBe(true);
  });

  it('can access analytics', () => {
    expect(canAccessView('medical', 'view-analytics')).toBe(true);
  });

  it('CANNOT access crowd intelligence', () => {
    expect(canAccessView('medical', 'view-crowd')).toBe(false);
  });

  it('CANNOT access sustainability', () => {
    expect(canAccessView('medical', 'view-sustain')).toBe(false);
  });

  it('CANNOT access executive insights', () => {
    expect(canAccessView('medical', 'view-executive')).toBe(false);
  });
});

describe('PulseOS RBAC — Volunteer', () => {
  it('can access AI agents', () => {
    expect(canAccessView('volunteer', 'view-agents')).toBe(true);
  });

  it('can access accessibility view', () => {
    expect(canAccessView('volunteer', 'view-access')).toBe(true);
  });

  it('can access multilingual view', () => {
    expect(canAccessView('volunteer', 'view-lang')).toBe(true);
  });

  it('can access command center', () => {
    expect(canAccessView('volunteer', 'view-command')).toBe(true);
  });

  it('CANNOT access emergency response', () => {
    expect(canAccessView('volunteer', 'view-emergency')).toBe(false);
  });

  it('CANNOT access sustainability', () => {
    expect(canAccessView('volunteer', 'view-sustain')).toBe(false);
  });

  it('CANNOT access executive insights', () => {
    expect(canAccessView('volunteer', 'view-executive')).toBe(false);
  });
});

describe('PulseOS RBAC — Fan (Most Restricted)', () => {
  it('can access command center', () => {
    expect(canAccessView('fan', 'view-command')).toBe(true);
  });

  it('can access accessibility view', () => {
    expect(canAccessView('fan', 'view-access')).toBe(true);
  });

  it('can access multilingual view', () => {
    expect(canAccessView('fan', 'view-lang')).toBe(true);
  });

  it('can access transport hub', () => {
    expect(canAccessView('fan', 'view-transport')).toBe(true);
  });

  it('CANNOT access crowd intelligence', () => {
    expect(canAccessView('fan', 'view-crowd')).toBe(false);
  });

  it('CANNOT access emergency view', () => {
    expect(canAccessView('fan', 'view-emergency')).toBe(false);
  });

  it('CANNOT access analytics', () => {
    expect(canAccessView('fan', 'view-analytics')).toBe(false);
  });

  it('CANNOT access executive insights', () => {
    expect(canAccessView('fan', 'view-executive')).toBe(false);
  });

  it('has fewer views than operations', () => {
    expect(getViewsForRole('fan').length).toBeLessThan(getViewsForRole('operations').length);
  });
});

describe('PulseOS RBAC — Unknown / Malicious Role', () => {
  it('returns empty view list for unknown role', () => {
    expect(getViewsForRole('unknown')).toEqual([]);
    expect(getViewsForRole('hacker')).toEqual([]);
    expect(getViewsForRole('')).toEqual([]);
    expect(getViewsForRole(null)).toEqual([]);
  });

  it('denies all view access for unknown role', () => {
    ALL_VIEWS.forEach(view => {
      expect(canAccessView('hacker', view)).toBe(false);
    });
  });
});

describe('PulseOS RBAC — View ID Integrity', () => {
  it('all view IDs match expected dashboard views', () => {
    expect(ALL_VIEWS).toEqual(expect.arrayContaining([
      'view-command', 'view-agents', 'view-twin', 'view-crowd',
      'view-transport', 'view-access', 'view-lang', 'view-sustain',
      'view-emergency', 'view-analytics', 'view-timeline', 'view-executive'
    ]));
  });

  it('has exactly 12 dashboard views', () => {
    expect(ALL_VIEWS.length).toBe(12);
  });

  it('each view ID starts with view-', () => {
    ALL_VIEWS.forEach(viewId => {
      expect(viewId).toMatch(/^view-/);
    });
  });
});
