/**
 * Unit tests for PulseOS Input Sanitization
 * Tests XSS prevention, HTML escaping, and URL validation
 */

'use strict';

// ===== Inline sanitization logic (mirrors security/sanitize.js) =====

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

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"'`\\]/g, '');
}

function sanitizeURL(url) {
  if (typeof url !== 'string') return '#';
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}

function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Tests =====

describe('PulseOS Sanitization — sanitizeText()', () => {
  it('escapes HTML angle brackets', () => {
    expect(sanitizeText('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes closing script tag', () => {
    const result = sanitizeText('<script>alert(1)</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('escapes ampersands', () => {
    expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes double quotes', () => {
    expect(sanitizeText('Say "hello"')).toBe('Say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeText("It's fine")).toBe('It&#x27;s fine');
  });

  it('escapes forward slashes', () => {
    expect(sanitizeText('a/b')).toBe('a&#x2F;b');
  });

  it('returns empty string for null', () => {
    expect(sanitizeText(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(sanitizeText(undefined)).toBe('');
  });

  it('returns empty string for numbers', () => {
    expect(sanitizeText(123)).toBe('');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('prevents onerror XSS in img tag — encodes all dangerous characters', () => {
    const xss = '<img src=x onerror="alert(1)">';
    const result = sanitizeText(xss);
    // sanitizeText encodes angle brackets into entities making HTML inert
    expect(result).not.toContain('<img');
    expect(result).not.toContain('<');
    expect(result).toContain('&lt;img');
    expect(result).toContain('&gt;');
  });

  it('prevents javascript: protocol in href — encodes all dangerous characters', () => {
    const xss = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeText(xss);
    // Angle brackets and quotes are encoded — no raw HTML tags
    expect(result).not.toContain('<a');
    expect(result).not.toContain('<');
    expect(result).toContain('&lt;a');
  });

  it('handles already-safe plain text unchanged (other than encoding)', () => {
    const plain = 'Hello World 2026';
    expect(sanitizeText(plain)).toBe('Hello World 2026');
  });
});

describe('PulseOS Sanitization — sanitizeInput()', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('removes angle brackets', () => {
    expect(sanitizeInput('hello<world>')).toBe('helloworld');
  });

  it('removes double quotes', () => {
    expect(sanitizeInput('say "hi"')).toBe('say hi');
  });

  it('removes single quotes', () => {
    expect(sanitizeInput("it's ok")).toBe('its ok');
  });

  it('removes backticks', () => {
    expect(sanitizeInput('`code`')).toBe('code');
  });

  it('preserves valid email characters', () => {
    expect(sanitizeInput('user@example.com')).toBe('user@example.com');
  });

  it('preserves hyphens and underscores', () => {
    expect(sanitizeInput('user-name_2026')).toBe('user-name_2026');
  });

  it('returns empty string for null', () => {
    expect(sanitizeInput(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('PulseOS Sanitization — sanitizeURL()', () => {
  it('allows https:// URLs', () => {
    expect(sanitizeURL('https://fifa.com')).toBe('https://fifa.com');
  });

  it('allows http:// URLs', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com');
  });

  it('allows mailto: URLs', () => {
    expect(sanitizeURL('mailto:test@fifa.org')).toBe('mailto:test@fifa.org');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('#');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeURL('data:text/html,<h1>xss</h1>')).toBe('#');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeURL('vbscript:msgbox(1)')).toBe('#');
  });

  it('returns # for non-URL strings', () => {
    expect(sanitizeURL('not-a-url')).toBe('#');
  });

  it('returns # for empty string', () => {
    expect(sanitizeURL('')).toBe('#');
  });

  it('returns # for null', () => {
    expect(sanitizeURL(null)).toBe('#');
  });

  it('returns # for undefined', () => {
    expect(sanitizeURL(undefined)).toBe('#');
  });
});

describe('PulseOS Sanitization — sanitizeHTML()', () => {
  it('converts tags to text entities', () => {
    const result = sanitizeHTML('<b>bold</b>');
    expect(result).toContain('&lt;');
    expect(result).not.toContain('<b>');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
  });

  it('preserves plain text', () => {
    expect(sanitizeHTML('Hello FIFA 2026')).toBe('Hello FIFA 2026');
  });
});
