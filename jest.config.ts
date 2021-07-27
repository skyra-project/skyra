import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
	coverageProvider: 'v8',
	displayName: 'unit test',
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
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts'],
	coveragePathIgnorePatterns: [
		'<rootDir>/src/lib/api',
		'<rootDir>/src/lib/database/migrations',
		'<rootDir>/src/lib/extensions',
		'<rootDir>/src/lib/grpc/generated',
		'<rootDir>/src/lib/SkyraClient.ts',
		'<rootDir>/src/lib/structures',
		'<rootDir>/src/lib/types',
		'<rootDir>/src/lib/util/Models'
	]
});
