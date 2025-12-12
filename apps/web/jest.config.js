module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@reduxjs/toolkit|react-redux|@react-native-async-storage|immer)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', '!src/**/*.d.ts', '!**/__tests__/**'],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  // Codecov enforces 90% threshold at PR level
  // This allows local tests to pass while building up coverage
  coverageThreshold: {
    './src/components/ui/': {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
    './src/components/layout/': {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
    './src/components/molecules/': {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@llmengineer/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
};
