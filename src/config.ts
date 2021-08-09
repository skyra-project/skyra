// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { transformOauthGuildsAndUser } from '#lib/api/utils';
import type { QueueClientOptions } from '#lib/audio';
import { envParseArray, envParseBoolean, envParseInteger, envParseString } from '#lib/env';
import { CATEGORIES as TRIVIA_CATEGORIES } from '#lib/games/TriviaManager';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { LanguageFormatters } from '#lib/types/Constants';
import { getHandler } from '#root/languages/index';
import { GuildSettings, readSettings } from '#lib/database';
import { Emojis, rootFolder } from '#utils/constants';
import type { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import { codeBlock, toTitleCase } from '@sapphire/utilities';
import { APIWebhook, WebhookType } from 'discord-api-types/v9';
import {
	ActivitiesOptions,
	ActivityType,
	ClientOptions,
	DefaultMessageNotificationLevel,
	ExplicitContentFilterLevel,
	LimitedCollection,
	Options,
	Permissions,
	PermissionString
} from 'discord.js';
import { config } from 'dotenv-cra';
import i18next, { FormatFunction, InterpolationOptions } from 'i18next';
import { join } from 'path';

// Read config:
config({
	debug: process.env.DOTENV_DEBUG_ENABLED ? envParseBoolean('DOTENV_DEBUG_ENABLED') : undefined,
	path: join(rootFolder, 'src', '.env')
});

export const OWNERS = envParseArray('CLIENT_OWNERS');
export const SISTER_CLIENTS = envParseArray('SISTER_CLIENTS');

function parseAudio(): QueueClientOptions | undefined {
	if (!envParseBoolean('REDIS_ENABLED', false)) return undefined;
	if (!envParseBoolean('AUDIO_ENABLED', false)) return undefined;

	const host = envParseString('AUDIO_HOST');
	const port = envParseInteger('AUDIO_PORT').toString();

	return {
		userID: envParseString('CLIENT_ID'),
		password: envParseString('AUDIO_PASSWORD'),
		redis: {
			host: envParseString('REDIS_HOST'),
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

export function parseAnalytics(): ConnectionOptions {
	const url = envParseString('INFLUX_URL');
	const token = envParseString('INFLUX_TOKEN');

	return {
		url,
		token
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
		transformers: [transformOauthGuildsAndUser],
		domainOverwrite: envParseString('OAUTH_DOMAIN_OVERWRITE')
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

function parsePresenceActivity(): ActivitiesOptions[] {
	const { CLIENT_PRESENCE_NAME } = process.env;
	if (!CLIENT_PRESENCE_NAME) return [];

	return [
		{
			name: CLIENT_PRESENCE_NAME,
			type: envParseString('CLIENT_PRESENCE_TYPE', 'LISTENING') as ActivityType
		}
	];
}

function parseRegExpPrefix(): RegExp | undefined {
	const { CLIENT_REGEX_PREFIX } = process.env;
	return CLIENT_REGEX_PREFIX ? new RegExp(CLIENT_REGEX_PREFIX, 'i') : undefined;
}

export const PROJECT_ROOT = join(rootFolder, process.env.OVERRIDE_ROOT_PATH ?? 'dist');
export const LANGUAGE_ROOT = join(PROJECT_ROOT, 'languages');

function parseInternationalizationDefaultVariablesPermissions() {
	const keys = Object.keys(Permissions.FLAGS) as readonly PermissionString[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<PermissionString, PermissionString>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		TRIVIA_CATEGORIES: Object.keys(TRIVIA_CATEGORIES ?? {}).join(', '),
		VERSION: process.env.CLIENT_VERSION,
		LOADING: Emojis.Loading,
		SHINY: Emojis.Shiny,
		GREENTICK: Emojis.GreenTick,
		REDCROSS: Emojis.RedCross,
		DEFAULT_PREFIX: process.env.CLIENT_PREFIX,
		CLIENT_ID: process.env.CLIENT_ID,
		...parseInternationalizationDefaultVariablesPermissions()
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return {
		escapeValue: false,
		defaultVariables: parseInternationalizationDefaultVariables(),
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
				case LanguageFormatters.ExplicitContentFilter: {
					switch (value as ExplicitContentFilterLevel) {
						case 'DISABLED':
							return i18next.t(LanguageKeys.Guilds.ExplicitContentFilterDisabled, { ...options, lng: language });
						case 'MEMBERS_WITHOUT_ROLES':
							return i18next.t(LanguageKeys.Guilds.ExplicitContentFilterMembersWithoutRoles, { ...options, lng: language });
						case 'ALL_MEMBERS':
							return i18next.t(LanguageKeys.Guilds.ExplicitContentFilterAllMembers, { ...options, lng: language });
						default:
							return i18next.t(LanguageKeys.Globals.Unknown, { ...options, lng: language });
					}
				}
				case LanguageFormatters.MessageNotifications: {
					switch (value as DefaultMessageNotificationLevel) {
						case 'ALL_MESSAGES':
							return i18next.t(LanguageKeys.Guilds.MessageNotificationsAll, { ...options, lng: language });
						case 'ONLY_MENTIONS':
							return i18next.t(LanguageKeys.Guilds.MessageNotificationsMentions, { ...options, lng: language });
						default:
							return i18next.t(LanguageKeys.Globals.Unknown, { ...options, lng: language });
					}
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
	};
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'default',
		defaultNS: 'globals',
		defaultLanguageDirectory: LANGUAGE_ROOT,
		fetchLanguage: async ({ guild }) => {
			if (!guild) return 'en-US';

			const [language] = await readSettings(guild, [GuildSettings.Language]);
			return language;
		},
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
			interpolation: parseInternationalizationInterpolation()
		})
	};
}

export const CLIENT_OPTIONS: ClientOptions = {
	audio: parseAudio(),
	allowedMentions: { users: [], roles: [] },
	api: parseApi(),
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: envParseString('CLIENT_PREFIX'),
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	],
	loadDefaultErrorListeners: false,
	makeCache: Options.cacheWithLimits({
		// TODO: Uncomment this with v13.1.0
		// ...Options.defaultMakeCacheSettings,
		MessageManager: {
			sweepInterval: 180,
			sweepFilter: LimitedCollection.filterByLifetime({
				lifetime: 900,
				getComparisonTimestamp: (m) => m.editedTimestamp ?? m.createdTimestamp
			})
		}
	}),
	partials: ['CHANNEL'],
	presence: { activities: parsePresenceActivity() },
	regexPrefix: parseRegExpPrefix(),
	restTimeOffset: 0,
	schedule: { interval: 5000 },
	nms: {
		everyone: 5,
		role: 2
	},
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug
	},
	i18n: parseInternationalizationOptions()
};

function parseWebhookError(): APIWebhook | null {
	const { WEBHOOK_ERROR_TOKEN } = process.env;
	if (!WEBHOOK_ERROR_TOKEN) return null;

	return {
		application_id: null,
		avatar: envParseString('WEBHOOK_ERROR_AVATAR'),
		channel_id: envParseString('WEBHOOK_ERROR_CHANNEL'),
		guild_id: envParseString('WEBHOOK_ERROR_GUILD'),
		id: envParseString('WEBHOOK_ERROR_ID'),
		name: envParseString('WEBHOOK_ERROR_NAME'),
		token: WEBHOOK_ERROR_TOKEN,
		type: WebhookType.Incoming
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
