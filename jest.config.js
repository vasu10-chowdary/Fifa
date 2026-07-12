/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    'security/**/*.js',
    '!js/charts.js',
    '!js/digital-twin.js',
    '!js/landing.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000
};
