'use strict';

/** @type {import('jest').Config} */
module.exports = {
  moduleNameMapper: {
    '^(\\.{1,2}/.+)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/helpers/', '<rootDir>/.claude/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
};
