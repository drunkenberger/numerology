module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@jyotish/numerology$':     '<rootDir>/../../packages/numerology/src/index.ts',
    '^@jyotish/html-templates$': '<rootDir>/../../packages/html-templates/src/index.ts',
  },
};
