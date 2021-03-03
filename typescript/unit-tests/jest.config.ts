import type { Config } from '@jest/types';

// Make ts-jest shut up about "unsupported TS version"
process.env.TS_JEST_DISABLE_VER_CHECKER = 'true';

export default async (): Promise<Config.InitialOptions> => ({
	rootDir: '../../',
	coverageProvider: 'v8',
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/typescript/unit-tests/tests/**/*.test.ts'],
	moduleNameMapper: {
		'^#utils/(.*)$': '<rootDir>/typescript/src/lib/util/$1',
		'^#lib/audio$': '<rootDir>/typescript/src/audio/lib',
		'^#lib/(.*)$': '<rootDir>/typescript/src/lib/$1',
		'^#root/(.*)$': '<rootDir>/typescript/src/$1',
		'^#mocks/(.*)$': '<rootDir>/typescript/unit-tests/tests/mocks/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/typescript/unit-tests/jest.setup.ts'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/typescript/unit-tests/tsconfig.json'
		}
	},
	collectCoverageFrom: ['<rootDir>/typescript/src/lib/**/*.ts'],
	coveragePathIgnorePatterns: [
		'<rootDir>/typescript/src/lib/api',
		'<rootDir>/typescript/src/lib/database/migrations',
		'<rootDir>/typescript/src/lib/extensions',
		'<rootDir>/typescript/src/lib/grpc/generated',
		'<rootDir>/typescript/src/lib/SkyraClient.ts',
		'<rootDir>/typescript/src/lib/structures',
		'<rootDir>/typescript/src/lib/types',
		'<rootDir>/typescript/src/lib/util/Models'
	]
});
