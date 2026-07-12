/**
 * PulseOS — Jest Test Environment Setup
 * Configures jsdom environment, mocks browser APIs
 */

// ===== localStorage mock =====
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null
  };
})();

// ===== sessionStorage mock =====
const sessionStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

// ===== Canvas mock =====
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  setTransform: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  drawImage: jest.fn(),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: () => ({ width: 100 }),
  createLinearGradient: () => ({ addColorStop: jest.fn() }),
  createRadialGradient: () => ({ addColorStop: jest.fn() }),
  putImageData: jest.fn(),
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  canvas: { width: 800, height: 600 }
});

// ===== window.location mock =====
delete window.location;
window.location = {
  href: 'http://localhost/',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: () => 'http://localhost/'
};

// ===== crypto mock =====
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {}
  }
});

// ===== Animation mocks =====
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// ===== Console suppression in tests =====
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// ===== Cleanup between tests =====
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
