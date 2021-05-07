import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
	rootDir: '../../',
	coverageProvider: 'v8',
	displayName: 'unit test',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/typescript/unit-tests/tests/**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': 'esbuild-jest'
	},
	moduleNameMapper: {
		'^#utils/(.*)$': '<rootDir>/typescript/src/lib/util/$1',
		'^#lib/audio$': '<rootDir>/typescript/src/audio/lib',
		'^#lib/(.*)$': '<rootDir>/typescript/src/lib/$1',
		'^#root/(.*)$': '<rootDir>/typescript/src/$1',
		'^#mocks/(.*)$': '<rootDir>/typescript/unit-tests/tests/mocks/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/typescript/unit-tests/jest.setup.ts'],
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
