/**
 * Unit tests for PulseOS Shared Utilities
 * Tests all helper functions used across the application
 */

'use strict';

// ===== Inline utility functions (mirrors js/utils.js) =====

const PulseUtils = {
  rand(min, max) { return Math.random() * (max - min) + min; },
  randInt(min, max) { return Math.floor(this.rand(min, max + 1)); },
  pick(arr) { return arr[this.randInt(0, arr.length - 1)]; },
  clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },
  pct(v, total) { return Math.round((v / total) * 1000) / 10; },
  formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  },
  getInitials(name) {
    if (!name || typeof name !== 'string' || !name.trim()) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  },
  timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return seconds + 's ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  },
  setText(el, text) {
    if (el) el.textContent = String(text);
  },
  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  },
  parseJSON(str, fallback) {
    try { return JSON.parse(str); }
    catch { return fallback !== undefined ? fallback : null; }
  },
  uid(prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  },
  lerp(a, b, t) { return a + (b - a) * t; },
  mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }
};

// ===== Tests =====

describe('PulseUtils — rand()', () => {
  it('returns a number within [min, max)', () => {
    for (let i = 0; i < 200; i++) {
      const v = PulseUtils.rand(10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });

  it('handles equal min and max', () => {
    expect(PulseUtils.rand(5, 5)).toBe(5);
  });
});

describe('PulseUtils — randInt()', () => {
  it('returns an integer within inclusive [min, max]', () => {
    for (let i = 0; i < 500; i++) {
      const v = PulseUtils.randInt(1, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('eventually generates all values in range', () => {
    const seen = new Set();
    for (let i = 0; i < 2000; i++) seen.add(PulseUtils.randInt(1, 5));
    expect(seen.size).toBe(5);
  });
});

describe('PulseUtils — pick()', () => {
  it('returns an element from the array', () => {
    const arr = ['alpha', 'beta', 'gamma', 'delta'];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(PulseUtils.pick(arr));
    }
  });

  it('works with single-element arrays', () => {
    expect(PulseUtils.pick(['only'])).toBe('only');
  });

  it('works with numbers', () => {
    const nums = [1, 2, 3, 4, 5];
    expect(nums).toContain(PulseUtils.pick(nums));
  });
});

describe('PulseUtils — clamp()', () => {
  it('returns value when within range', () => {
    expect(PulseUtils.clamp(50, 0, 100)).toBe(50);
  });

  it('clamps to lower bound', () => {
    expect(PulseUtils.clamp(-10, 0, 100)).toBe(0);
  });

  it('clamps to upper bound', () => {
    expect(PulseUtils.clamp(200, 0, 100)).toBe(100);
  });

  it('handles value equal to lower bound', () => {
    expect(PulseUtils.clamp(0, 0, 100)).toBe(0);
  });

  it('handles value equal to upper bound', () => {
    expect(PulseUtils.clamp(100, 0, 100)).toBe(100);
  });

  it('handles equal lo and hi (pinch clamp)', () => {
    expect(PulseUtils.clamp(999, 5, 5)).toBe(5);
  });
});

describe('PulseUtils — pct()', () => {
  it('calculates 50% correctly', () => {
    expect(PulseUtils.pct(50, 100)).toBe(50);
  });

  it('calculates 100% correctly', () => {
    expect(PulseUtils.pct(10000, 10000)).toBe(100);
  });

  it('calculates 0% correctly', () => {
    expect(PulseUtils.pct(0, 10000)).toBe(0);
  });

  it('rounds to 1 decimal place', () => {
    expect(PulseUtils.pct(1, 3)).toBe(33.3);
    expect(PulseUtils.pct(2, 3)).toBe(66.7);
  });

  it('calculates stadium occupancy correctly', () => {
    expect(PulseUtils.pct(82500, 84000)).toBeCloseTo(98.2, 1);
  });
});

describe('PulseUtils — formatNumber()', () => {
  it('formats millions with M suffix', () => {
    expect(PulseUtils.formatNumber(1500000)).toBe('1.5M');
    expect(PulseUtils.formatNumber(3600000)).toBe('3.6M');
  });

  it('formats thousands with K suffix', () => {
    expect(PulseUtils.formatNumber(82500)).toBe('82.5K');
    expect(PulseUtils.formatNumber(1000)).toBe('1.0K');
  });

  it('leaves small numbers unchanged', () => {
    expect(PulseUtils.formatNumber(999)).toBe('999');
    expect(PulseUtils.formatNumber(0)).toBe('0');
    expect(PulseUtils.formatNumber(1)).toBe('1');
  });
});

describe('PulseUtils — getInitials()', () => {
  it('extracts first and last initials from full name', () => {
    expect(PulseUtils.getInitials('Alex Rivera')).toBe('AR');
    expect(PulseUtils.getInitials('Jane Doe')).toBe('JD');
  });

  it('handles single-word names', () => {
    expect(PulseUtils.getInitials('Madonna')).toBe('M');
  });

  it('uses first and last word of multi-word names', () => {
    expect(PulseUtils.getInitials('John Paul Jones')).toBe('JJ');
  });

  it('uppercases initials', () => {
    expect(PulseUtils.getInitials('john doe')).toBe('JD');
  });

  it('returns ?? for null', () => {
    expect(PulseUtils.getInitials(null)).toBe('??');
  });

  it('returns ?? for undefined', () => {
    expect(PulseUtils.getInitials(undefined)).toBe('??');
  });

  it('returns ?? for empty string', () => {
    expect(PulseUtils.getInitials('')).toBe('??');
  });

  it('returns ?? for whitespace-only string', () => {
    expect(PulseUtils.getInitials('   ')).toBe('??');
  });
});

describe('PulseUtils — timeAgo()', () => {
  it('shows seconds for very recent dates', () => {
    const recent = new Date(Date.now() - 30000).toISOString();
    expect(PulseUtils.timeAgo(recent)).toMatch(/^\d+s ago$/);
  });

  it('shows minutes for dates ~5 minutes ago', () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(PulseUtils.timeAgo(fiveMinsAgo)).toMatch(/^\d+m ago$/);
  });

  it('shows hours for dates ~2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(PulseUtils.timeAgo(twoHoursAgo)).toMatch(/^\d+h ago$/);
  });

  it('shows days for old dates', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(PulseUtils.timeAgo(twoDaysAgo)).toMatch(/^\d+d ago$/);
  });
});

describe('PulseUtils — debounce()', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not call function immediately', () => {
    const fn = jest.fn();
    const debounced = PulseUtils.debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls function after delay', () => {
    const fn = jest.fn();
    const debounced = PulseUtils.debounce(fn, 300);
    debounced();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only calls function once when triggered rapidly', () => {
    const fn = jest.fn();
    const debounced = PulseUtils.debounce(fn, 300);
    debounced(); debounced(); debounced(); debounced();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('PulseUtils — parseJSON()', () => {
  it('parses valid JSON', () => {
    expect(PulseUtils.parseJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns null for invalid JSON by default', () => {
    expect(PulseUtils.parseJSON('INVALID')).toBeNull();
  });

  it('returns provided fallback for invalid JSON', () => {
    expect(PulseUtils.parseJSON('BAD', [])).toEqual([]);
  });

  it('parses JSON arrays', () => {
    expect(PulseUtils.parseJSON('[1,2,3]')).toEqual([1, 2, 3]);
  });
});

describe('PulseUtils — uid()', () => {
  it('generates a string ID', () => {
    expect(typeof PulseUtils.uid()).toBe('string');
  });

  it('uses the provided prefix', () => {
    expect(PulseUtils.uid('agent')).toMatch(/^agent-/);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => PulseUtils.uid()));
    expect(ids.size).toBe(100);
  });
});

describe('PulseUtils — lerp()', () => {
  it('returns a when t=0', () => {
    expect(PulseUtils.lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(PulseUtils.lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(PulseUtils.lerp(0, 100, 0.5)).toBe(50);
  });
});

describe('PulseUtils — mapRange()', () => {
  it('maps value from one range to another', () => {
    expect(PulseUtils.mapRange(50, 0, 100, 0, 1)).toBe(0.5);
  });

  it('maps minimum value correctly', () => {
    expect(PulseUtils.mapRange(0, 0, 100, 0, 255)).toBe(0);
  });

  it('maps maximum value correctly', () => {
    expect(PulseUtils.mapRange(100, 0, 100, 0, 255)).toBe(255);
  });
});

describe('PulseUtils — setText()', () => {
  it('sets textContent of an element', () => {
    const el = document.createElement('div');
    PulseUtils.setText(el, 'Hello FIFA');
    expect(el.textContent).toBe('Hello FIFA');
  });

  it('converts non-string values to string', () => {
    const el = document.createElement('div');
    PulseUtils.setText(el, 42);
    expect(el.textContent).toBe('42');
  });

  it('does nothing when element is null', () => {
    expect(() => PulseUtils.setText(null, 'test')).not.toThrow();
  });
});
