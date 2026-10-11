module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Mirrors tsconfig.json's "@/*" -> "./*" path alias, which ts-jest's
  // type-checking already understands but Jest's own module resolution
  // does not without this mapping.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ── NO ORDINARY TEST REACHES THE INTERNET ────────────────────────────────
  //   `global.fetch` refuses by default; see jest.setup.network-guard.js for
  //   the measurement that made this necessary and the explicit opt-in for a
  //   genuine live integration test.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.network-guard.js'],
  // Kept. It was the earlier workaround for the same cause — throttling made
  // the flake rarer without removing the dependency — and it still bounds
  // memory and CPU on this machine.
  maxWorkers: 2,
};
