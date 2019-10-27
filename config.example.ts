// Remove `.example` from the file extension to configure Skyra

import { KlasaClientOptions } from 'klasa';
import { PoolConfig } from 'pg';
import { ServerOptions } from 'http';
import { APIWebhookData } from './src/lib/types/DiscordAPI';
import ApiRequest from './src/lib/structures/api/ApiRequest';
import ApiResponse from './src/lib/structures/api/ApiResponse';

export const WATCH_FILES = true;
export const DEV = 'DEV' in process.env ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);
export const DEV_LAVALINK = 'DEV_LAVALINK' in process.env ? process.env.DEV_LAVALINK === 'true' : !DEV;
export const DEV_PGSQL = 'DEV_PGSQL' in process.env ? process.env.DEV_PGSQL === 'true' : !DEV;
export const EVLYN_PORT = 3100;

export const NAME = 'Skyra';
export const CLIENT_ID = DEV ? '365184854914236416' : '266624760782258186';
export const CLIENT_SECRET = DEV ? '' : '';

const DASHBOARD_SERVER_OPTIONS: ServerOptions = {
	IncomingMessage: ApiRequest,
	ServerResponse: ApiResponse
};

export const DATABASE_DEVELOPMENT: PoolConfig = {};
export const DATABASE_PRODUCTION: PoolConfig = {
	database: '',
	password: '',
	user: ''
};
export const VERSION = '5.2.1 Nirom';

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
	consoleEvents: { verbose: true },
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
		password: 'PASSWORD',
		userID: CLIENT_ID
	},
	messageCacheLifetime: 300,
	messageCacheMaxSize: 50,
	messageSweepInterval: 120,
	pieceDefaults: {
		commands: { deletable: true, quotedStringSupport: true },
		ipcMonitors: { enabled: true },
		monitors: { ignoreOthers: false },
		rawEvents: { enabled: true }
	},
	prefix: DEV ? 'sd!' : 's!',
	presence: { activity: { name: DEV ? 'sd!help' : 'Skyra, help', type: 'LISTENING' } },
	providers: {
		'default': DEV_PGSQL ? 'postgres' : 'json',
		'postgres': DEV ? DATABASE_DEVELOPMENT : DATABASE_PRODUCTION
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
		serverOptions: DASHBOARD_SERVER_OPTIONS
	}
};

export const WEBHOOK_ERROR: APIWebhookData = DEV
	? {
		avatar: '7d52ea85e9ffe07ac8b15d4b60cf29d7',
		channel_id: '432495057552277504',
		guild_id: '254360814063058944',
		id: '516616472269946885',
		name: 'Skyra Development',
		token: ''
	}
	: {
		avatar: '8555889e893215cac63193dc2ad0b52d',
		channel_id: '432495057552277504',
		guild_id: '254360814063058944',
		id: '516619861397340182',
		name: 'Skyra Production',
		token: ''
	};

export const TOKENS = {
	BLIZZARD: '',
	KITSU: {
		ID: 'AWQO5J657S',
		KEY: 'NzYxODA5NmY0ODRjYTRmMzQ2YjMzNzNmZmFhNjY5ZGRmYjZlMzViN2VkZDIzMGUwYjM5ZjQ5NjAwZGI4ZTc5MHJlc3RyaWN0SW5kaWNlcz1wcm9kdWN0aW9uX21lZGlhJmZpbHRlcnM9Tk9UK2FnZVJhdGluZyUzQVIxOA=='
	},
	BOT: {
		DEV: '',
		STABLE: ''
	},
	BOTS_FOR_DISCORD: '',
	BOTS_ON_DISCORD: '',
	CRYPTOCOMPARE: '',
	DISCORD_BOTS: '',
	DISCORD_BOT_LIST: '',
	DISCORD_BOT_ORG: '',
	GOOGLE_API: '',
	GOOGLE_MAP_API: '',
	TWITCH: {
		CLIENT_ID: '',
		SECRET: ''
	},
	WEATHER_API: '',
	WEEB_SH: '',
	WOLFRAM: '',
	NINTENDO: {
		ID: 'U3B6GR4UA3',
		KEY: '9a20c93440cf63cf1a7008d75f7438bf'
	},
	THEMOVIEDATABASE: '',
	INTERNETGAMEDATABASE: ''
};
