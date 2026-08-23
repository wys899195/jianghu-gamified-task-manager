/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: [
        '<rootDir>/src',
        '<rootDir>/test',
    ],
    testMatch: [
        '**/?(*.)+(spec|test).ts',
    ],
    extensionsToTreatAsEsm: [
        '.ts',
    ],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: '<rootDir>/tsconfig.test.json',
            },
        ],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/server.ts',
        '!src/testInit.ts',
    ],
};
