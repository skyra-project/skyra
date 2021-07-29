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
	setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
	collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts'],
	coveragePathIgnorePatterns: [
		'<rootDir>/src/lib/api',
		'<rootDir>/src/lib/customCommands',
		'<rootDir>/src/lib/database/migrations',
		'<rootDir>/src/lib/database/repositories',
		'<rootDir>/src/lib/extensions',
		'<rootDir>/src/lib/games/base',
		'<rootDir>/src/lib/games/connect-four',
		'<rootDir>/src/lib/games/HungerGamesUsage.ts',
		'<rootDir>/src/lib/games/Slotmachine.ts',
		'<rootDir>/src/lib/games/tic-tac-toe',
		'<rootDir>/src/lib/games/WheelOfFortune.ts',
		'<rootDir>/src/lib/grpc/generated',
		'<rootDir>/src/lib/moderation',
		'<rootDir>/src/lib/SkyraClient.ts',
		'<rootDir>/src/lib/structures',
		'<rootDir>/src/lib/types',
		'<rootDir>/src/lib/util/APIs',
		'<rootDir>/src/lib/util/External',
		'<rootDir>/src/lib/util/Links',
		'<rootDir>/src/lib/util/Models',
		'<rootDir>/src/lib/util/Notifications',
		'<rootDir>/src/lib/util/Parsers',
		'<rootDir>/src/lib/util/Security/GuildSecurity.ts',
		'<rootDir>/src/lib/util/Security/ModerationActions.ts',
		'<rootDir>/src/lib/weather'
	]
});
