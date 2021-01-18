// Remove `.example` from the file extension to configure Skyra

import type { ClientOptions as InfluxDBClientOptions } from '@influxdata/influxdb-client';
import type { APIWebhook } from 'discord-api-types/v6';
import type { ClientOptions } from 'discord.js';
import type { RedisOptions } from 'ioredis';
import type { PoolConfig } from 'pg';

export const DEV = Reflect.has(process.env, 'DEV') ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);
export const ENABLE_LAVALINK = 'ENABLE_LAVALINK' in process.env ? process.env.ENABLE_LAVALINK === 'true' : !DEV;
export const ENABLE_INFLUX = 'ENABLE_INFLUX' in process.env ? process.env.ENABLE_INFLUX === 'true' : !DEV;
export const ENABLE_LOCAL_POKEDEX = 'ENABLE_LOCAL_POKEDEX' in process.env ? process.env.ENABLE_LOCAL_POKEDEX === 'true' : !DEV;
export const WSS_PORT = 565;

export const NAME = 'Skyra';
export const PREFIX = 'sd!';
// #region secrets
export const CLIENT_ID = '';
export const CLIENT_SECRET = '';
// #endregion
export const REDIRECT_URI = 'http://localhost.org:3000/oauth/callback';
export const SCOPE = 'identify guilds';
export const DOMAIN = 'http://localhost.org:3000';
export const TWITCH_CALLBACK = 'http://localhost/twitch/stream_change/';

export const PGSQL_DATABASE_NAME = '';
export const PGSQL_DATABASE_PASSWORD = '';
export const PGSQL_DATABASE_USER = '';
export const PGSQL_DATABASE_PORT = 5432;
export const PGSQL_DATABASE_HOST = 'localhost';

export const LAVALINK_HOST = 'localhost';
export const LAVALINK_PORT = '2333';
export const LAVALINK_PASSWORD = 'skyra';

export const PGSQL_DATABASE_OPTIONS: PoolConfig = {
	database: PGSQL_DATABASE_NAME,
	password: PGSQL_DATABASE_PASSWORD,
	user: PGSQL_DATABASE_USER
};

export const REDIS_OPTIONS: RedisOptions = {
	port: 8287,
	db: 1,
	password: 'redis'
};

export const INFLUX_URL = 'http://localhost:8285';
// #region secrets
export const INFLUX_TOKEN = '';
// #endregion
export const INFLUX_ORG = 'Skyra-Project';
export const INFLUX_ORG_ANALYTICS_BUCKET = 'analytics';
export const INFLUX_OPTIONS: InfluxDBClientOptions = {
	url: INFLUX_URL,
	token: INFLUX_TOKEN
};

export const VERSION = '5.6.0 [Paradise Edition]';

export const CLIENT_OPTIONS: ClientOptions = {
	audio: {
		userID: CLIENT_ID,
		password: LAVALINK_PASSWORD,
		redis: REDIS_OPTIONS,
		hosts: {
			rest: `http://${LAVALINK_HOST}:${LAVALINK_PORT}`,
			ws: {
				url: `ws://${LAVALINK_HOST}:${LAVALINK_PORT}`,
				options: {
					resumeKey: 'SKYRA-RESUME-KEY',
					resumeTimeout: 60
				}
			}
		}
	},
	shards: 'auto',
	commandEditing: true,
	commandLogging: false,
	console: {
		colors: {
			debug: {
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'magenta', style: null }
			},
			error: {
				message: { background: null, text: null, style: null },
				time: { background: 'red', text: 'white', style: null }
			},
			info: {
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			log: {
				message: { background: null, text: null, style: null },
				time: { background: null, text: 'lightblue', style: null }
			},
			verbose: {
				message: { background: null, text: 'gray', style: null },
				time: { background: null, text: 'gray', style: null }
			},
			warn: {
				message: { background: null, text: 'lightyellow', style: null },
				time: { background: null, text: 'lightyellow', style: null }
			},
			wtf: {
				message: { background: null, text: 'red', style: null },
				time: { background: 'red', text: 'white', style: null }
			}
		},
		useColor: true,
		utc: true
	},
	consoleEvents: { verbose: true, debug: true },
	dev: DEV,
	ws: {
		intents: [
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_BANS',
			'GUILD_EMOJIS',
			'GUILD_VOICE_STATES',
			'GUILD_MESSAGES',
			'GUILD_MESSAGE_REACTIONS',
			'DIRECT_MESSAGES',
			'DIRECT_MESSAGE_REACTIONS'
		]
	},
	messageCacheLifetime: 900,
	messageCacheMaxSize: 300,
	messageSweepInterval: 180,
	pieceDefaults: {
		commands: { deletable: true, quotedStringSupport: true, flagSupport: false },
		serializers: { enabled: true, aliases: [] },
		tasks: { enabled: true }
	},
	prefix: PREFIX,
	presence: { activity: { name: `${PREFIX}help`, type: 'LISTENING' } },
	readyMessage: (client) =>
		`${NAME} ${VERSION} ready! [${client.user!.tag}] [ ${client.guilds.cache.size} [G]] [ ${client.guilds.cache
			.reduce((a, b) => a + b.memberCount, 0)
			.toLocaleString()} [U]].`,
	regexPrefix: DEV ? undefined : /^(hey +)?(eva|skyra)[,! ]/i,
	restTimeOffset: 0,
	schedule: { interval: 5000 },
	slowmode: 750,
	slowmodeAggressive: true,
	typing: false,
	api: {
		auth: {
			id: CLIENT_ID,
			secret: CLIENT_SECRET,
			cookie: 'SKYRA_AUTH',
			redirect: REDIRECT_URI,
			scopes: ['identify', 'guilds']
		},
		prefix: '/',
		origin: DOMAIN,
		listenOptions: { port: 1234 }
	}
};

// #region secrets
export const WEBHOOK_FEEDBACK: Partial<APIWebhook> | null = null;

export const WEBHOOK_ERROR: Partial<APIWebhook> = {
	avatar: '33f84e7a6a5596bafb2b56d218ee8c8d',
	channel_id: '648663012345118741',
	guild_id: '541738403230777351',
	id: '648663047615021058',
	name: 'Skyra Development',
	token: ''
};

export const WEBHOOK_DATABASE: Partial<APIWebhook> | null = null;
// #endregion

export const TOKENS = {
	// #region secrets
	BOT_TOKEN: '',
	BOTLIST_SPACE_KEY: '',
	BOTS_FOR_DISCORD_KEY: '',
	BOTS_ON_DISCORD_KEY: '',
	BRAWL_STARS_KEY: '',
	CLASH_OF_CLANS_KEY: '',
	CRYPTOCOMPARE_KEY: '',
	DARKSKY_WEATHER_KEY: '',
	DISCORD_BOT_LIST: '',
	DISCORD_BOTS: '',
	FORTNITE_KEY: '',
	GOOGLE_API_KEY: '',
	// CUSTOM_SEARCH keys can be identical, there are 2 keys so IMAGE can be set to exclusively search for images.
	GOOGLE_CUSTOM_SEARCH_IMAGE_KEY: '',
	GOOGLE_CUSTOM_SEARCH_WEB_KEY: '',
	GOOGLE_MAPS_API_KEY: '',
	INTERNETGAMEDATABASE_KEY: '',
	KITSU_ID: 'AWQO5J657S',
	KITSU_KEY:
		'NzYxODA5NmY0ODRjYTRmMzQ2YjMzNzNmZmFhNjY5ZGRmYjZlMzViN2VkZDIzMGUwYjM5ZjQ5NjAwZGI4ZTc5MHJlc3RyaWN0SW5kaWNlcz1wcm9kdWN0aW9uX21lZGlhJmZpbHRlcnM9Tk9UK2FnZVJhdGluZyUzQVIxOA==',
	NINTENDO_ID: 'U3B6GR4UA3',
	NINTENDO_KEY: '9a20c93440cf63cf1a7008d75f7438bf',
	OWLBOT: '',
	SENTRY_URL: '',
	THEMOVIEDATABASE_KEY: '',
	TIMEZONEDB_KEY: '',
	TOP_GG: '',
	TWITCH_CLIENT_ID: '',
	TWITCH_SECRET: '',
	TWITCH_WEBHOOK_SECRET: '',
	WEBHOOK_B4D: '',
	WEBHOOK_TOPGG: '',
	WEEB_SH_KEY: '',
	XIVAPI_KEY: ''
	// #endregion
};
