module.exports = {
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
	moduleNameMapper: {
		'^@utils/(.*)$': '<rootDir>/src/lib/util/$1',
		'^@lib/(.*)$': '<rootDir>/src/lib/$1',
		'^@root/(.*)$': '<rootDir>/src/$1',
		'^@mocks/(.*)$': '<rootDir>/__mocks__/$1',
		'^@testutils$': '<rootDir>/__tests__/testutils.ts'
	},
	setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
	globals: {
		'ts-jest': {
			tsConfig: '<rootDir>/__tests__/tsconfig.json'
		}
	},
	coveragePathIgnorePatterns: [
		'<rootDir>/src/arguments',
		'<rootDir>/src/commands',
		'<rootDir>/src/events',
		'<rootDir>/src/extendables',
		'<rootDir>/src/finalizers',
		'<rootDir>/src/inhibitors',
		'<rootDir>/src/ipcMonitors',
		'<rootDir>/src/languages',
		'<rootDir>/src/middlewares',
		'<rootDir>/src/monitors',
		'<rootDir>/src/providers',
		'<rootDir>/src/routes',
		'<rootDir>/src/serializers',
		'<rootDir>/src/tasks',
		'<rootDir>/src/config.ts',
		'<rootDir>/src/config.example.ts',
		'<rootDir>/src/Skyra.ts',
		'<rootDir>/__tests__/testutils.ts',
		'<rootDir>/src/lib/structures',
		'<rootDir>/src/lib/util/Models'
	]
};
