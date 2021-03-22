// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { transformOauthGuildsAndUser } from '#lib/api/utils';
import type { QueueClientOptions } from '#lib/audio';
import { envParseArray, envParseBoolean, envParseInteger, envParseString } from '#lib/env';
import { CATEGORIES as TRIVIA_CATEGORIES } from '#lib/games/TriviaManager';
import { LanguageFormatters } from '#lib/types/Constants';
import { getHandler } from '#root/languages/index';
import { Emojis, rootFolder } from '#utils/constants';
import { LogLevel } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import { codeBlock, toTitleCase } from '@sapphire/utilities';
import type { APIWebhook } from 'discord-api-types/v6';
import type { ActivityType, ClientOptions, PresenceData } from 'discord.js';
import { config } from 'dotenv-cra';
import i18next, { FormatFunction } from 'i18next';
import { join } from 'path';

// Read config:
config({ debug: process.env.DOTENV_DEBUG_ENABLED ? envParseBoolean('DOTENV_DEBUG_ENABLED') : undefined, path: join(rootFolder, 'src', '.env') });

export const OWNERS = envParseArray('CLIENT_OWNERS');

function parseAudio(): QueueClientOptions | undefined {
	if (!envParseBoolean('AUDIO_ENABLED', false)) return undefined;

	const host = envParseString('AUDIO_HOST');
	const port = envParseInteger('AUDIO_PORT').toString();

	return {
		userID: envParseString('CLIENT_ID'),
		password: envParseString('AUDIO_PASSWORD'),
		redis: {
			port: envParseInteger('REDIS_PORT'),
			db: envParseInteger('REDIS_DB'),
			password: envParseString('REDIS_PASSWORD')
		},
		hosts: {
			rest: `http://${host}:${port}`,
			ws: {
				url: `ws://${host}:${port}`,
				options: {
					resumeKey: envParseString('AUDIO_RESUME_KEY'),
					resumeTimeout: envParseInteger('AUDIO_RESUME_TIMEOUT')
				}
			}
		}
	};
}

function parseApiAuth(): ServerOptionsAuth | undefined {
	if (!process.env.OAUTH_SECRET) return undefined;

	return {
		id: envParseString('CLIENT_ID'),
		secret: envParseString('OAUTH_SECRET'),
		cookie: envParseString('OAUTH_COOKIE'),
		redirect: envParseString('OAUTH_REDIRECT_URI'),
		scopes: envParseArray('OAUTH_SCOPE'),
		transformers: [transformOauthGuildsAndUser]
	};
}

function parseApi(): ServerOptions | undefined {
	if (!envParseBoolean('API_ENABLED', false)) return undefined;

	return {
		auth: parseApiAuth(),
		prefix: envParseString('API_PREFIX', '/'),
		origin: envParseString('API_ORIGIN'),
		listenOptions: { port: envParseInteger('API_PORT') }
	};
}

function parsePresenceActivity(): PresenceData['activity'] | undefined {
	const { CLIENT_PRESENCE_NAME } = process.env;
	if (!CLIENT_PRESENCE_NAME) return undefined;

	return {
		name: CLIENT_PRESENCE_NAME,
		type: envParseString('CLIENT_PRESENCE_TYPE', 'LISTENING') as ActivityType
	};
}

function parseRegExpPrefix(): RegExp | undefined {
	const { CLIENT_REGEX_PREFIX } = process.env;
	return CLIENT_REGEX_PREFIX ? new RegExp(CLIENT_REGEX_PREFIX, 'i') : undefined;
}

export const CLIENT_OPTIONS: ClientOptions = {
	audio: parseAudio(),
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
	defaultPrefix: envParseString('CLIENT_PREFIX'),
	presence: { activity: parsePresenceActivity() },
	regexPrefix: parseRegExpPrefix(),
	restTimeOffset: 0,
	schedule: { interval: 5000 },
	api: parseApi(),
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	loadDefaultErrorEvents: false,
	nms: {
		everyone: 5,
		role: 2
	},
	logger: {
		level: process.env.NODE_ENV === 'production' ? LogLevel.Info : LogLevel.Debug
	},
	i18n: {
		defaultMissingKey: 'default',
		defaultNS: 'globals',
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: 'en-US',
			defaultNS: 'globals',
			overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
			initImmediate: false,
			interpolation: {
				escapeValue: false,
				defaultVariables: {
					TRIVIA_CATEGORIES: Object.keys(TRIVIA_CATEGORIES ?? {}).join(', '),
					VERSION: process.env.CLIENT_VERSION,
					LOADING: Emojis.Loading,
					SHINY: Emojis.Shiny,
					GREENTICK: Emojis.GreenTick,
					REDCROSS: Emojis.RedCross,
					DEFAULT_PREFIX: process.env.CLIENT_PREFIX,
					CLIENT_ID: process.env.CLIENT_ID,
					/* Permissions */
					ADMINISTRATOR: 'ADMINISTRATOR',
					VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
					MANAGE_GUILD: 'MANAGE_GUILD',
					MANAGE_ROLES: 'MANAGE_ROLES',
					MANAGE_CHANNELS: 'MANAGE_CHANNELS',
					KICK_MEMBERS: 'KICK_MEMBERS',
					BAN_MEMBERS: 'BAN_MEMBERS',
					CREATE_INSTANT_INVITE: 'CREATE_INSTANT_INVITE',
					CHANGE_NICKNAME: 'CHANGE_NICKNAME',
					MANAGE_NICKNAMES: 'MANAGE_NICKNAMES',
					MANAGE_EMOJIS: 'MANAGE_EMOJIS',
					MANAGE_WEBHOOKS: 'MANAGE_WEBHOOKS',
					VIEW_CHANNEL: 'VIEW_CHANNEL',
					SEND_MESSAGES: 'SEND_MESSAGES',
					SEND_TTS_MESSAGES: 'SEND_TTS_MESSAGES',
					MANAGE_MESSAGES: 'MANAGE_MESSAGES',
					EMBED_LINKS: 'EMBED_LINKS',
					ATTACH_FILES: 'ATTACH_FILES',
					READ_MESSAGE_HISTORY: 'READ_MESSAGE_HISTORY',
					MENTION_EVERYONE: 'MENTION_EVERYONE',
					USE_EXTERNAL_EMOJIS: 'USE_EXTERNAL_EMOJIS',
					ADD_REACTIONS: 'ADD_REACTIONS',
					CONNECT: 'CONNECT',
					SPEAK: 'SPEAK',
					STREAM: 'STREAM',
					MUTE_MEMBERS: 'MUTE_MEMBERS',
					DEAFEN_MEMBERS: 'DEAFEN_MEMBERS',
					MOVE_MEMBERS: 'MOVE_MEMBERS',
					USE_VAD: 'USE_VAD',
					PRIORITY_SPEAKER: 'PRIORITY_SPEAKER',
					VIEW_GUILD_INSIGHTS: 'VIEW_GUILD_INSIGHTS'
				},
				format: (...[value, format, language, options]: Parameters<FormatFunction>) => {
					switch (format as LanguageFormatters) {
						case LanguageFormatters.AndList: {
							return getHandler(language!).listAnd.format(value as string[]);
						}
						case LanguageFormatters.OrList: {
							return getHandler(language!).listOr.format(value as string[]);
						}
						case LanguageFormatters.Permissions: {
							return i18next.t(`permissions:${value}`, { ...options, lng: language });
						}
						case LanguageFormatters.PermissionsAndList: {
							return getHandler(language!).listAnd.format(
								(value as string[]).map((value) => i18next.t(`permissions:${value}`, { ...options, lng: language }))
							);
						}
						case LanguageFormatters.HumanLevels: {
							return i18next.t(`humanLevels:${value}`, { ...options, lng: language });
						}
						case LanguageFormatters.ToTitleCase: {
							return toTitleCase(value);
						}
						case LanguageFormatters.CodeBlock: {
							return codeBlock('', value);
						}
						case LanguageFormatters.JsCodeBlock: {
							return codeBlock('js', value);
						}
						case LanguageFormatters.Number: {
							return getHandler(language!).number.format(value as number);
						}
						case LanguageFormatters.NumberCompact: {
							return getHandler(language!).numberCompact.format(value as number);
						}
						case LanguageFormatters.Ordinal: {
							return getHandler(language!).ordinal(value as number);
						}
						case LanguageFormatters.Duration: {
							return getHandler(language!).duration.format(value as number, options?.precision ?? 2);
						}
						case LanguageFormatters.Date:
							return getHandler(language!).date.format(value as number);
						case LanguageFormatters.DateFull:
							return getHandler(language!).dateFull.format(value as number);
						case LanguageFormatters.DateTime: {
							return getHandler(language!).dateTime.format(value as number);
						}
						default:
							return value as string;
					}
				}
			}
		})
	}
};

function parseWebhookError(): Partial<APIWebhook> | null {
	const { WEBHOOK_ERROR_TOKEN } = process.env;
	if (!WEBHOOK_ERROR_TOKEN) return null;

	return {
		avatar: envParseString('WEBHOOK_ERROR_AVATAR'),
		channel_id: envParseString('WEBHOOK_ERROR_CHANNEL'),
		guild_id: envParseString('WEBHOOK_ERROR_GUILD'),
		id: envParseString('WEBHOOK_ERROR_ID'),
		name: envParseString('WEBHOOK_ERROR_NAME'),
		token: WEBHOOK_ERROR_TOKEN
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
