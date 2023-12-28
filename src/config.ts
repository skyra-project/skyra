import { transformOauthGuildsAndUser } from '#lib/api/utils';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { CATEGORIES as TRIVIA_CATEGORIES } from '#lib/games/TriviaManager';
import { getT } from '#lib/i18n/translate';
import { getHandler } from '#root/languages/index';
import { minutes, seconds } from '#utils/common';
import { Emojis, LanguageFormatters, rootFolder } from '#utils/constants';
import type { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import { envIsDefined, envParseArray, envParseBoolean, envParseInteger, envParseString, setup } from '@skyra/env-utilities';
import {
	ActivityType,
	GatewayIntentBits,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildVerificationLevel,
	Options,
	Partials,
	PermissionFlagsBits,
	type ActivitiesOptions,
	type ClientOptions,
	type LocaleString,
	type OAuth2Scopes,
	type WebhookClientData
} from 'discord.js';
import type { FormatFunction, InterpolationOptions } from 'i18next';
import { join } from 'node:path';

// Read config:
setup(join(rootFolder, 'src', '.env'));

export const OWNERS = envParseArray('CLIENT_OWNERS');

export function parseAnalytics(): ConnectionOptions {
	const url = envParseString('INFLUX_URL');
	const token = envParseString('INFLUX_TOKEN');

	return {
		url,
		token
	};
}

function parseApiAuth(): ServerOptionsAuth | undefined {
	if (!envIsDefined('OAUTH_SECRET')) return undefined;

	return {
		id: envParseString('CLIENT_ID'),
		secret: envParseString('OAUTH_SECRET'),
		cookie: envParseString('OAUTH_COOKIE'),
		redirect: envParseString('OAUTH_REDIRECT_URI'),
		scopes: envParseArray('OAUTH_SCOPE') as OAuth2Scopes[],
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
			type: ActivityType[envParseString('CLIENT_PRESENCE_TYPE', 'Listening') as keyof typeof ActivityType]
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
	const keys = Object.keys(PermissionFlagsBits) as readonly (keyof typeof PermissionFlagsBits)[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<keyof typeof PermissionFlagsBits, keyof typeof PermissionFlagsBits>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		TRIVIA_CATEGORIES: Object.keys(TRIVIA_CATEGORIES ?? {}).join(', '),
		VERSION: process.env.CLIENT_VERSION,
		LOADING: Emojis.Loading,
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
		format: (...[value, format, lng, options]: Parameters<FormatFunction>) => {
			const language = (lng ?? 'en-US') as LocaleString;
			switch (format as LanguageFormatters) {
				case LanguageFormatters.AndList: {
					return getHandler(language!).listAnd.format(value as string[]);
				}
				case LanguageFormatters.OrList: {
					return getHandler(language!).listOr.format(value as string[]);
				}
				case LanguageFormatters.Permissions: {
					return getT(language)(`permissions:${value}`, options);
				}
				case LanguageFormatters.PermissionsAndList: {
					const t = getT(language);
					return getHandler(language!).listAnd.format((value as string[]).map((value) => t(`permissions:${value}`, options)));
				}
				case LanguageFormatters.HumanLevels: {
					return getT(language)(`humanLevels:${GuildVerificationLevel[value]}`, options);
				}
				case LanguageFormatters.ExplicitContentFilter: {
					return getT(language)(`guilds:explicitContentFilter${GuildExplicitContentFilter[value]}`, options);
				}
				case LanguageFormatters.MessageNotifications: {
					return getT(language)(`guilds:defaultMessageNotifications${GuildDefaultMessageNotifications[value]}`, options);
				}
				case LanguageFormatters.Number: {
					return getHandler(language!).number.format(value as number);
				}
				case LanguageFormatters.NumberCompact: {
					return getHandler(language!).numberCompact.format(value as number);
				}
				case LanguageFormatters.Duration: {
					return getHandler(language!).duration.format(value as number, (options?.precision as number) ?? 2);
				}
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
		fetchLanguage: ({ guild }) => {
			if (!guild) return 'en-US';

			return readSettings(guild, GuildSettings.Language);
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
	allowedMentions: { users: [], roles: [] },
	api: parseApi(),
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: envParseString('CLIENT_PREFIX'),
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.MessageContent
	],
	loadDefaultErrorListeners: false,
	loadMessageCommandListeners: true,
	makeCache: Options.cacheEverything(),
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: minutes.toSeconds(3),
			lifetime: minutes.toSeconds(15)
		}
	},
	partials: [Partials.Channel],
	presence: { activities: parsePresenceActivity() },
	regexPrefix: parseRegExpPrefix(),
	schedule: { interval: seconds(5) },
	nms: {
		everyone: 5,
		role: 2
	},
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug
	},
	i18n: parseInternationalizationOptions()
};

function parseWebhookError(): WebhookClientData | null {
	const { WEBHOOK_ERROR_TOKEN } = process.env;
	if (!WEBHOOK_ERROR_TOKEN) return null;

	return {
		id: envParseString('WEBHOOK_ERROR_ID'),
		token: WEBHOOK_ERROR_TOKEN
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
