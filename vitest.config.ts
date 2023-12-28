import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: [
			{
				find: '#lib',
				replacement: '#lib',
				customResolver(source) {
					if (source === '#lib/database') return resolve('src/lib/database/index.ts');
					if (source === '#lib/database/entities') return resolve('src/lib/database/entities/index.ts');
					if (source === '#lib/database/keys') return resolve('src/lib/database/keys/index.ts');
					if (source === '#lib/database/settings') return resolve('src/lib/database/settings/index.ts');
					if (source === '#lib/discord') return resolve('src/lib/discord/index.ts');
					if (source === '#lib/moderation') return resolve('src/lib/moderation/index.ts');
					if (source === '#lib/moderation/managers') return resolve('src/lib/moderation/managers/index.ts');
					if (source === '#lib/moderation/workers') return resolve('src/lib/moderation/workers/index.ts');
					if (source === '#lib/structures') return resolve('src/lib/structures/index.ts');
					if (source === '#lib/structures/managers') return resolve('src/lib/structures/managers/index.ts');
					if (source === '#lib/setup') return resolve('src/lib/setup/index.ts');
					if (source === '#lib/types') return resolve('src/lib/types/index.ts');
					if (source === '#lib/i18n/languageKeys') return resolve('src/lib/i18n/languageKeys/index.ts');
					return source.replace('#lib', resolve('src/lib'));
				}
			},
			{ find: /^#root\/(.*)/, replacement: resolve('src/$1.ts') },
			{ find: '#languages', replacement: resolve('src/languages/index.ts') },
			{
				find: '#utils',
				replacement: '#utils',
				customResolver(source) {
					if (source === '#utils/common') return resolve('src/lib/util/common/index.ts');
					if (source === '#utils/functions') return resolve('src/lib/util/functions/index.ts');
					return source.replace('#utils', resolve('src/lib/util'));
				}
			}
		]
	},
	test: {
		setupFiles: ['./tests/vitest.setup.ts'],
		globals: true,
		coverage: {
			reporter: ['text', 'lcov', 'cobertura'],
			include: ['src/lib/**'],
			exclude: [
				'src/lib/api',
				'src/lib/database/entities',
				'src/lib/database/index.ts',
				'src/lib/database/migrations',
				'src/lib/database/repositories',
				'src/lib/database/settings',
				'src/lib/database/utils',
				'src/lib/discord',
				'src/lib/env',
				'src/lib/extensions',
				'src/lib/games/base',
				'src/lib/games/connect-four',
				'src/lib/games/HungerGamesUsage.ts',
				'src/lib/games/Slotmachine.ts',
				'src/lib/games/tic-tac-toe',
				'src/lib/games/WheelOfFortune.ts',
				'src/lib/i18n/structures/Augments.d.ts',
				'src/lib/moderation',
				'src/lib/setup/PaginatedMessage.ts',
				'src/lib/SkyraClient.ts',
				'src/lib/structures',
				'src/lib/types',
				'src/lib/util/APIs',
				'src/lib/util/Color.ts',
				'src/lib/util/decorators.ts',
				'src/lib/util/External',
				'src/lib/util/Leaderboard.ts',
				'src/lib/util/Links',
				'src/lib/util/LongLivingReactionCollector.ts',
				'src/lib/util/Models',
				'src/lib/util/Notifications',
				'src/lib/util/Parsers',
				'src/lib/util/PreciseTimeout.ts',
				'src/lib/util/PromptList.ts',
				'src/lib/util/Security/GuildSecurity.ts',
				'src/lib/util/Security/ModerationActions.ts',
				'src/lib/util/Timers.ts',
				'src/lib/weather'
			]
		}
	},
	esbuild: {
		target: 'es2022'
	}
});
