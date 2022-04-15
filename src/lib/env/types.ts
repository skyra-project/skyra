export type BooleanString = 'true' | 'false';
export type IntegerString = `${bigint}`;

export type SkyraEnvAny = keyof SkyraEnv;
export type SkyraEnvString = { [K in SkyraEnvAny]: SkyraEnv[K] extends BooleanString | IntegerString ? never : K }[SkyraEnvAny];
export type SkyraEnvBoolean = { [K in SkyraEnvAny]: SkyraEnv[K] extends BooleanString ? K : never }[SkyraEnvAny];
export type SkyraEnvInteger = { [K in SkyraEnvAny]: SkyraEnv[K] extends IntegerString ? K : never }[SkyraEnvAny];

export interface SkyraEnv {
	NODE_ENV: 'test' | 'development' | 'production';
	DOTENV_DEBUG_ENABLED: BooleanString;

	CLIENT_NAME: string;
	CLIENT_VERSION: string;
	CLIENT_PREFIX: string;
	CLIENT_REGEX_PREFIX: string;
	CLIENT_OWNERS: string;
	CLIENT_ID: string;
	CLIENT_SHARDS: string;

	CLIENT_PRESENCE_NAME: string;
	CLIENT_PRESENCE_TYPE: string;

	SISTER_CLIENTS: string;

	API_ENABLED: BooleanString;
	API_ORIGIN: string;
	API_PORT: IntegerString;
	API_PREFIX: string;

	OAUTH_COOKIE: string;
	OAUTH_DOMAIN_OVERWRITE: string;
	OAUTH_REDIRECT_URI: string;
	OAUTH_SCOPE: string;
	OAUTH_SECRET: string;

	TWITCH_CALLBACK: string;

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

	INFLUX_ENABLED: BooleanString;
	INFLUX_URL: string;
	INFLUX_TOKEN: string;
	INFLUX_ORG: string;
	INFLUX_ORG_ANALYTICS_BUCKET: string;

	SAELEM_ENABLED: BooleanString;
	SAELEM_URL: string;

	OUTFLUX_URL: string;
	GRAPHQL_STARWARS_URL: string;
	HASTEBIN_POST_URL: string;
	HASTEBIN_GET_URL: string;

	WEBHOOK_ERROR_ID: string;
	WEBHOOK_ERROR_TOKEN: string;

	WORKER_COUNT: IntegerString;

	DISCORD_TOKEN: string;
	BOTLIST_SPACE_TOKEN: string;
	BOTS_FOR_DISCORD_TOKEN: string;
	BOTS_ON_DISCORD_TOKEN: string;
	CRYPTOCOMPARE_TOKEN: string;
	DISCORD_BOT_LIST_TOKEN: string;
	DISCORD_BOTS_TOKEN: string;
	GOOGLE_API_TOKEN: string;
	KITSU_ID: string;
	KITSU_TOKEN: string;
	NINTENDO_ID: string;
	NINTENDO_TOKEN: string;
	OWLBOT_TOKEN: string;
	SENTRY_URL: string;
	THEMOVIEDATABASE_TOKEN: string;
	TOP_GG_TOKEN: string;
	TWITCH_CLIENT_ID: string;
	TWITCH_EVENTSUB_SECRET: string;
	TWITCH_TOKEN: string;
	WEBHOOK_DISCORDS_TOKEN: string;
	WEBHOOK_TOPGG_TOKEN: string;
	WEEB_SH_TOKEN: string;
}
