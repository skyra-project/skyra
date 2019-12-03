// Remove `.example` from the file extension to configure Skyra

import { KlasaClientOptions } from 'klasa';
import { PoolConfig } from 'pg';
import { APIWebhookData } from './src/lib/types/DiscordAPI';
import ApiRequest from './src/lib/structures/api/ApiRequest';
import ApiResponse from './src/lib/structures/api/ApiResponse';
import { ISingleHostConfig } from 'influx';

export const WATCH_FILES = true;
export const DEV = 'DEV' in process.env ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);
export const ENABLE_LAVALINK = 'ENABLE_LAVALINK' in process.env ? process.env.ENABLE_LAVALINK === 'true' : !DEV;
export const ENABLE_POSTGRES = 'ENABLE_POSTGRES' in process.env ? process.env.ENABLE_POSTGRES === 'true' : !DEV;
export const ENABLE_INFLUX = 'ENABLE_INFLUX' in process.env ? process.env.ENABLE_INFLUX === 'true' : !DEV;
export const ENABLE_LOCAL_POKEDEX = 'ENABLE_LOCAL_POKEDEX' in process.env ? process.env.ENABLE_LOCAL_POKEDEX === 'true' : !DEV;
export const EVLYN_PORT = 3100;

export const NAME = 'Skyra';
export const PREFIX = 'sd!';
export const CLIENT_ID = '';
export const CLIENT_SECRET = '';
export const REDIRECT_URI = 'http://localhost:3000/oauth/callback';
export const SCOPE = 'identify guilds';
export const LAVALINK_PASSWORD = '';
export const TWITCH_CALLBACK = 'http://localhost/twitch/stream_change/';

export const PGSQL_DATABASE_NAME = '';
export const PGSQL_DATABASE_PASSWORD = '';
export const PGSQL_DATABASE_USER = '';
export const PGSQL_DATABASE_OPTIONS: PoolConfig = {
	database: PGSQL_DATABASE_NAME,
	password: PGSQL_DATABASE_PASSWORD,
	user: PGSQL_DATABASE_USER
};

export const INFLUX_HOST = 'localhost';
export const INFLUX_PORT = 8086;
export const INFLUX_USERNAME = '';
export const INFLUX_PASSWORD = '';
export const INFLUX_OPTIONS: ISingleHostConfig = {
	host: INFLUX_HOST,
	port: INFLUX_PORT,
	username: INFLUX_USERNAME,
	password: INFLUX_PASSWORD
};

export const VERSION = '5.2.3 Nirom';

export const CLIENT_OPTIONS: KlasaClientOptions = {
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
	clientID: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	dev: DEV,
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
		'GUILD_MEMBER_UPDATE',
		'PRESENCE_UPDATE',
		'TYPING_START',
		'USER_UPDATE'
	],
	lavalink: {
		hosts: {
			rest: 'http://IP:REST_PORT',
			ws: 'ws://IP:WS_PORT'
		},
		password: LAVALINK_PASSWORD,
		userID: CLIENT_ID
	},
	messageCacheLifetime: 900,
	messageCacheMaxSize: 300,
	messageSweepInterval: 180,
	pieceDefaults: {
		commands: { deletable: true, quotedStringSupport: true, flagSupport: false },
		ipcMonitors: { enabled: true },
		monitors: { ignoreOthers: false },
		rawEvents: { enabled: true }
	},
	prefix: PREFIX,
	presence: { activity: { name: `${PREFIX}help`, type: 'LISTENING' } },
	providers: {
		'default': ENABLE_POSTGRES ? 'postgres' : 'json',
		'postgres': PGSQL_DATABASE_OPTIONS
	},
	readyMessage: client =>
		`${NAME} ${VERSION} ready! [${client.user!.tag}] [ ${client.guilds.size} [G]] [ ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	regexPrefix: DEV ? undefined : /^(hey +)?(eva|skyra)[,! ]/i,
	restTimeOffset: 0,
	schedule: { interval: 5000 },
	slowmode: 750,
	slowmodeAggressive: true,
	typing: false,
	dashboardHooks: {
		apiPrefix: '/',
		port: 1234,
		serverOptions: {
			IncomingMessage: ApiRequest,
			ServerResponse: ApiResponse
		}
	}
};

export const WEBHOOK_ERROR: APIWebhookData = {
	avatar: '33f84e7a6a5596bafb2b56d218ee8c8d',
	channel_id: '648663012345118741',
	guild_id: '541738403230777351',
	id: '648663047615021058',
	name: 'Skyra Development',
	token: ''
};

export const TOKENS = {
	BLIZZARD_KEY: '',
	BOT_TOKEN: '',
	BOTS_FOR_DISCORD_KEY: '',
	BOTS_ON_DISCORD_KEY: '',
	CRYPTOCOMPARE_KEY: '',
	DARKSKY_WEATHER_KEY: '',
	DISCORD_BOT_LIST: '',
	DISCORD_BOT_ORG: '',
	DISCORD_BOTS: '',
	GOOGLE_API_KEY: '',
	GOOGLE_MAPS_API_KEY: '',
	INTERNETGAMEDATABASE_KEY: '',
	KITSU_ID: 'AWQO5J657S',
	KITSU_KEY: 'NzYxODA5NmY0ODRjYTRmMzQ2YjMzNzNmZmFhNjY5ZGRmYjZlMzViN2VkZDIzMGUwYjM5ZjQ5NjAwZGI4ZTc5MHJlc3RyaWN0SW5kaWNlcz1wcm9kdWN0aW9uX21lZGlhJmZpbHRlcnM9Tk9UK2FnZVJhdGluZyUzQVIxOA==',
	NINTENDO_ID: 'U3B6GR4UA3',
	NINTENDO_KEY: '9a20c93440cf63cf1a7008d75f7438bf',
	THEMOVIEDATABASE_KEY: '',
	TWITCH_CLIENT_ID: '',
	TWITCH_SECRET: '',
	TWITCH_WEBHOOK_SECRET: '',
	WEEB_SH_KEY: '',
	WOLFRAM_KEY: ''
};
