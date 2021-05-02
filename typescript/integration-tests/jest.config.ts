import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => ({
	rootDir: '../../',
	displayName: 'integration test',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/typescript/integration-tests/tests/**/*.test.ts'],
	moduleNameMapper: {
		'^#utils/(.*)$': '<rootDir>/typescript/src/lib/util/$1',
		'^#lib/audio$': '<rootDir>/typescript/src/audio/lib',
		'^#lib/(.*)$': '<rootDir>/typescript/src/lib/$1',
		'^#root/(.*)$': '<rootDir>/typescript/src/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/typescript/integration-tests/jest.setup.ts']
});
