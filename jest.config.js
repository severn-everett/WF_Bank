module.exports = {
    preset: 'ts-jest',
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
};