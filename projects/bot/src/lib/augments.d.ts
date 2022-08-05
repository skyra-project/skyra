import type { IntegerString } from '@skyra/env-utilities';

declare module '@skyra/env-utilities' {
	interface Env {
		CLIENT_VERSION: string;

		SENTRY_URL?: string;

		DISCORD_TOKEN: string;
		DISCORD_PUBLIC_KEY: string;

		REDIS_HOST: string;
		REDIS_PORT: IntegerString;
		REDIS_DB: IntegerString;
		REDIS_PASSWORD: string;

		BROKER_STREAM_NAME: string;
		BROKER_BLOCK?: IntegerString;
		BROKER_MAX?: IntegerString;
	}
}
