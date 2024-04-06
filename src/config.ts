import { transformOauthGuildsAndUser } from '#lib/api/utils';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { CATEGORIES as TRIVIA_CATEGORIES } from '#lib/games/TriviaManager';
import { getHandler } from '#root/languages/index';
import { minutes, seconds } from '#utils/common';
import { Emojis, LanguageFormatters, rootFolder } from '#utils/constants';
import type { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import { i18next, type I18nextFormatter, type InternationalizationOptions } from '@sapphire/plugin-i18next';
import { Time } from '@sapphire/time-utilities';
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
	TimestampStyles,
	time,
	type ActivitiesOptions,
	type ClientOptions,
	type LocaleString,
	type OAuth2Scopes,
	type WebhookClientData
} from 'discord.js';
import type { InterpolationOptions } from 'i18next';
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
	return { escapeValue: false, defaultVariables: parseInternationalizationDefaultVariables() };
}

function parseInternationalizationFormatters(): I18nextFormatter[] {
	const { t } = i18next;

	return [
		// Add custom formatters:
		{
			name: LanguageFormatters.Number,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		{
			name: LanguageFormatters.NumberCompact,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		{
			name: LanguageFormatters.Duration,
			format: (lng, options) => {
				const formatter = getHandler((lng ?? 'en-US') as LocaleString).duration;
				const precision = (options?.precision as number) ?? 2;
				return (value) => formatter.format(value, precision);
			},
			cached: true
		},
		{
			name: LanguageFormatters.HumanDateTime,
			format: (lng, options) => {
				const formatter = new Intl.DateTimeFormat(lng, { timeZone: 'Etc/UTC', dateStyle: 'short', timeStyle: 'medium', ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		// Add Discord markdown formatters:
		{ name: LanguageFormatters.DateTime, format: (value) => time(new Date(value), TimestampStyles.ShortDateTime) },
		// Add alias formatters:
		{
			name: LanguageFormatters.Permissions,
			format: (value, lng, options) => t(`permissions:${value}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.HumanLevels,
			format: (value, lng, options) => t(`humanLevels:${GuildVerificationLevel[value]}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.ExplicitContentFilter,
			format: (value, lng, options) => t(`guilds:explicitContentFilter${GuildExplicitContentFilter[value]}`, { lng, ...options }) as string
		},
		{
			name: LanguageFormatters.MessageNotifications,
			format: (value, lng, options) =>
				t(`guilds:defaultMessageNotifications${GuildDefaultMessageNotifications[value]}`, { lng, ...options }) as string
		}
	];
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
		formatters: parseInternationalizationFormatters(),
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: {
				'es-419': ['es-ES', 'en-US'], // Latin America Spanish falls back to Spain Spanish
				default: ['en-US']
			},
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
	rest: {
		timeout: Time.Minute * 2
	},
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
