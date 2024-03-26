import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import { OWNERS } from '#root/config';
import { getCodeStyle, getLogPrefix } from '#utils/functions';
import { ArgumentError, ResultError, UserError, container, type Command } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { cutText } from '@sapphire/utilities';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes, codeBlock, type Snowflake } from 'discord.js';
import { exists } from 'i18next';

const Root = LanguageKeys.Errors;

export function resolveError(t: TFunction, error: UserError | string) {
	return typeof error === 'string' ? resolveStringError(t, error) : resolveUserError(t, error);
}

function resolveStringError(t: TFunction, error: string) {
	return exists(error) ? (t(error) as string) : error;
}

function resolveUserError(t: TFunction, error: UserError) {
	const identifier = translate(error.identifier);
	return t(
		identifier,
		error instanceof ArgumentError
			? { ...error, ...(error.context as object), argument: error.argument.name, parameter: cutText(error.parameter.replaceAll('`', '῾'), 50) }
			: (error.context as any)
	) as string;
}

export function flattenError(command: Command, error: unknown): UserError | string | null {
	if (typeof error === 'string') return error;

	if (!(error instanceof Error)) {
		container.logger.fatal(getLogPrefix(command), 'Unknown unhandled error:', error);
		return null;
	}

	if (error instanceof ResultError) return flattenError(command, error.value);
	if (error instanceof UserError) return error;

	if (error instanceof DiscordAPIError) {
		container.logger.error(getLogPrefix(command), getCodeStyle(error.code.toString()), 'Unhandled error:', error);
		return getDiscordError(error.code as number);
	}

	if (error instanceof HTTPError) {
		container.logger.error(getLogPrefix(command), getCodeStyle(error.status.toString()), 'Unhandled error:', error);
		return getHttpError(error.status);
	}

	if (error.name === 'AbortError') {
		return LanguageKeys.System.DiscordAbortError;
	}

	container.logger.fatal(getLogPrefix(command), error);
	return null;
}

const sentry = envIsDefined('SENTRY_URL');
export function generateUnexpectedErrorMessage(userId: Snowflake, command: Command, t: TFunction, error: unknown) {
	if (OWNERS.includes(userId)) return codeBlock('js', String(error));
	if (!sentry) return t(LanguageKeys.Events.Errors.UnexpectedError);

	try {
		const report = captureException(error, { tags: { command: command.name } });
		return t(LanguageKeys.Events.Errors.UnexpectedErrorWithContext, { report });
	} catch (error) {
		return t(LanguageKeys.Events.Errors.UnexpectedError);
	}
}

function getDiscordError(code: RESTJSONErrorCodes) {
	switch (code) {
		case RESTJSONErrorCodes.UnknownChannel:
			return Root.GenericUnknownChannel;
		case RESTJSONErrorCodes.UnknownGuild:
			return Root.GenericUnknownGuild;
		case RESTJSONErrorCodes.UnknownMember:
			return Root.GenericUnknownMember;
		case RESTJSONErrorCodes.UnknownMessage:
			return Root.GenericUnknownMessage;
		case RESTJSONErrorCodes.UnknownRole:
			return Root.GenericUnknownRole;
		case RESTJSONErrorCodes.MissingAccess:
			return Root.GenericMissingAccess;
		default:
			return null;
	}
}

function getHttpError(status: number) {
	switch (status) {
		case 500:
			return Root.GenericDiscordInternalServerError;
		case 502:
		case 504:
			return Root.GenericDiscordGateway;
		case 503:
			return Root.GenericDiscordUnavailable;
		default:
			return null;
	}
}
