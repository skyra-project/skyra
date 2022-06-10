import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: [
			{ find: '#utils', replacement: resolve('src/lib/util') },
			{ find: '#lib', replacement: resolve('src/lib') },
			{ find: '#languages', replacement: resolve('src/lib/languages') },
			{ find: '#mocks', replacement: resolve('tests/mocks') },
			{ find: '#root', replacement: resolve('src') }
		]
	},
	test: {
		globals: true,
		coverage: {
			enabled: true,
			reporter: ['text', 'lcov', 'clover'],
			include: ['./src/lib/**/*.ts'],
			exclude: [
				resolve('tests'),
				resolve('src/lib/api'),
				resolve('src/lib/customCommands'),
				resolve('src/lib/database/entities'),
				resolve('src/lib/database/index.ts'),
				resolve('src/lib/database/migrations'),
				resolve('src/lib/database/repositories'),
				resolve('src/lib/database/settings'),
				resolve('src/lib/database/utils'),
				resolve('src/lib/discord'),
				resolve('src/lib/env'),
				resolve('src/lib/extensions'),
				resolve('src/lib/games/base'),
				resolve('src/lib/games/connect-four'),
				resolve('src/lib/games/HungerGamesUsage.ts'),
				resolve('src/lib/games/Slotmachine.ts'),
				resolve('src/lib/games/tic-tac-toe'),
				resolve('src/lib/games/WheelOfFortune.ts'),
				resolve('src/lib/i18n/structures/Augments.d.ts'),
				resolve('src/lib/moderation'),
				resolve('src/lib/setup/PaginatedMessage.ts'),
				resolve('src/lib/SkyraClient.ts'),
				resolve('src/lib/structures'),
				resolve('src/lib/types'),
				resolve('src/lib/util/APIs'),
				resolve('src/lib/util/Color.ts'),
				resolve('src/lib/util/decorators.ts'),
				resolve('src/lib/util/External'),
				resolve('src/lib/util/Leaderboard.ts'),
				resolve('src/lib/util/Links'),
				resolve('src/lib/util/LongLivingReactionCollector.ts'),
				resolve('src/lib/util/Models'),
				resolve('src/lib/util/Notifications'),
				resolve('src/lib/util/Parsers'),
				resolve('src/lib/util/PreciseTimeout.ts'),
				resolve('src/lib/util/PromptList.ts'),
				resolve('src/lib/util/Security/GuildSecurity.ts'),
				resolve('src/lib/util/Security/ModerationActions.ts'),
				resolve('src/lib/util/Timers.ts'),
				resolve('src/lib/weather')
			]
		}
	}
});
