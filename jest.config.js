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
		'^@mocks/(.*)$': '<rootDir>/__mocks__/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
	globals: {
		'ts-jest': {
			tsConfig: '<rootDir>/__tests__/tsconfig.json'
		}
	}
};
