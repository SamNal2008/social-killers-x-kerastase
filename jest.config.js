/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                verbatimModuleSyntax: false,
            }
        }],
    },
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/app/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
        '!src/**/__tests__/**',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/__tests__/**',
        '!app/**/*.test.{ts,tsx}',
        '!app/**/*.spec.{ts,tsx}',
        '!app/root.tsx',
        '!app/routes.ts',
    ],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
        '<rootDir>/app/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/app/**/*.{test,spec}.{ts,tsx}',
    ],
};
