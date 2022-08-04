/* eslint-disable @typescript-eslint/unified-signatures */
import type { WorkerManager } from '#lib/moderation/workers/WorkerManager';
import type { ScheduleManager } from '#lib/structures';
import type { ArrayString, BooleanString, IntegerString } from '@skyra/env-utilities';

declare module '@sapphire/pieces' {
	interface Container {
		// db: DbSet;
		schedule: ScheduleManager;
		// settings: SettingsManager;
		workers: WorkerManager;
	}
}

declare module '@skyra/env-utilities' {
	export interface Env {
		CLIENT_NAME: string;
		CLIENT_VERSION: string;
		CLIENT_PREFIX: string;
		CLIENT_REGEX_PREFIX: string;
		CLIENT_OWNERS: ArrayString;
		CLIENT_ID: string;
		CLIENT_SHARDS: string;

		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;

		SISTER_CLIENTS: ArrayString;

		API_ENABLED: BooleanString;
		API_ORIGIN: string;
		API_PORT: IntegerString;
		API_PREFIX: string;

		OAUTH_COOKIE: string;
		OAUTH_DOMAIN_OVERWRITE: string;
		OAUTH_REDIRECT_URI: string;
		OAUTH_SCOPE: ArrayString;
		OAUTH_SECRET: string;

		PGSQL_DATABASE_NAME: string;
		PGSQL_DATABASE_PASSWORD: string;
		PGSQL_DATABASE_USER: string;
		PGSQL_DATABASE_PORT: IntegerString;
		PGSQL_DATABASE_HOST: string;
		TYPEORM_DEBUG_LOGS: BooleanString;

		REDIS_HOST: string;
		REDIS_ENABLED: BooleanString;
		REDIS_PORT: IntegerString;
		REDIS_DB: IntegerString;
		REDIS_PASSWORD: string;

		HASTEBIN_POST_URL: string;
		HASTEBIN_GET_URL: string;

		WEBHOOK_ERROR_ID: string;
		WEBHOOK_ERROR_TOKEN: string;

		WORKER_COUNT: IntegerString;

		DISCORD_TOKEN: string;
		BOTLIST_SPACE_TOKEN: string;
		BOTS_FOR_DISCORD_TOKEN: string;
		BOTS_ON_DISCORD_TOKEN: string;
		DISCORD_BOT_LIST_TOKEN: string;
		DISCORD_BOTS_TOKEN: string;
		SENTRY_URL: string;
		TOP_GG_TOKEN: string;
	}
}
