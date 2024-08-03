import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ResultError, UserError } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes } from 'discord.js';
import { exists } from 'i18next';

const Root = LanguageKeys.Errors;

export function stringifyError(t: TFunction, error: unknown): string {
	switch (typeof error) {
		case 'string':
			return stringifyErrorString(t, error);
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'undefined':
		case 'symbol':
		case 'function':
			return String(error);
		case 'object':
			return stringifyErrorObject(t, error);
	}
}

function stringifyErrorString(t: TFunction, error: string): string {
	return exists(error) ? (t(error) as string) : error;
}

function stringifyErrorObject(t: TFunction, error: object | null): string {
	return error instanceof Error ? stringifyErrorException(t, error) : String(error);
}

const isSuppressedError =
	typeof SuppressedError === 'undefined'
		? (error: Error): error is SuppressedError => 'error' in error && 'suppressed' in error
		: (error: Error): error is SuppressedError => error instanceof SuppressedError;

function stringifyErrorException(t: TFunction, error: Error): string {
	if (error.name === 'AbortError') return t(LanguageKeys.System.DiscordAbortError);
	if (error instanceof UserError) return t(error.identifier, error.context as any) as string;
	if (error instanceof ResultError) return stringifyError(t, error.value);
	if (error instanceof DiscordAPIError) return stringifyDiscordAPIError(t, error);
	if (error instanceof HTTPError) return stringifyHTTPError(t, error);
	if (error instanceof AggregateError) return error.errors.map((value) => stringifyError(t, value)).join('\n');
	if (isSuppressedError(error)) return stringifyError(t, error.suppressed);
	return error.message;
}

function stringifyDiscordAPIError(t: TFunction, error: DiscordAPIError) {
	switch (error.code) {
		case RESTJSONErrorCodes.UnknownChannel:
			return t(Root.GenericUnknownChannel);
		case RESTJSONErrorCodes.UnknownGuild:
			return t(Root.GenericUnknownGuild);
		case RESTJSONErrorCodes.UnknownMember:
			return t(Root.GenericUnknownMember);
		case RESTJSONErrorCodes.UnknownMessage:
			return t(Root.GenericUnknownMessage);
		case RESTJSONErrorCodes.UnknownRole:
			return t(Root.GenericUnknownRole);
		case RESTJSONErrorCodes.MissingAccess:
			return t(Root.GenericMissingAccess);
		default:
			return error.message;
	}
}

function stringifyHTTPError(t: TFunction, error: HTTPError) {
	switch (error.status) {
		case 500:
			return t(Root.GenericDiscordInternalServerError);
		case 502:
		case 504:
			return t(Root.GenericDiscordGateway);
		case 503:
			return t(Root.GenericDiscordUnavailable);
		default:
			return error.message;
	}
}
