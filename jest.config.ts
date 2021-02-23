import type { Config } from '@jest/types';

// Make ts-jest shut up about "unsupported TS version"
process.env.TS_JEST_DISABLE_VER_CHECKER = 'true';

export default async (): Promise<Config.InitialOptions> => ({
	coverageProvider: 'v8',
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/tests/**/*.test.ts'],
	moduleNameMapper: {
		'^#utils/(.*)$': '<rootDir>/src/lib/util/$1',
		'^#lib/audio$': '<rootDir>/src/audio/lib',
		'^#lib/(.*)$': '<rootDir>/src/lib/$1',
		'^#root/(.*)$': '<rootDir>/src/$1',
		'^#mocks/(.*)$': '<rootDir>/tests/mocks/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tests/tsconfig.json'
		}
	},
	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules',
		'<rootDir>/tests/mocks',
		'<rootDir>/src/arguments',
		'<rootDir>/src/audio',
		'<rootDir>/src/commands',
		'<rootDir>/src/events',
		'<rootDir>/src/languages',
		'<rootDir>/src/preconditions',
		'<rootDir>/src/routes',
		'<rootDir>/src/serializers',
		'<rootDir>/src/tasks',
		'<rootDir>/src/config.ts',
		'<rootDir>/src/config.example.ts',
		'<rootDir>/src/Skyra.ts',
		'<rootDir>/src/lib/structures',
		'<rootDir>/src/lib/util/Models'
	]
});
