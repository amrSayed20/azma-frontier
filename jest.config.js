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
};
