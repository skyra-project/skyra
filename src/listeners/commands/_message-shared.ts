import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetchT, translate } from '#lib/i18n/translate';
import type { SkyraArgs } from '#lib/structures';
import { Colors, ZeroWidthSpace, rootFolder } from '#utils/constants';
import { sendTemporaryMessage } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { ArgumentError, Command, Events, UserError, container, type MessageCommandErrorPayload } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { MessageSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { codeBlock, cutText } from '@sapphire/utilities';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes, Routes, type Message } from 'discord.js';
import { generateUnexpectedErrorMessage } from './_shared.js';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export async function handleCommandError(error: unknown, payload: MessageCommandErrorPayload | MessageSubcommandErrorPayload) {
	const { message, command } = payload;
	let t: TFunction;
	let parameters: string;
	if ('args' in payload) {
		t = (payload.args as SkyraArgs).t;
		parameters = payload.parameters;
	} else {
		t = await fetchT({ guild: message.guild, channel: message.channel, user: message.author });
		parameters = message.content.slice(payload.context.commandPrefix.length + payload.context.commandName.length).trim();
	}

	// If the error was a string or an UserError, send it to the user:
	if (!(error instanceof Error)) return stringError(message, t, String(error));
	if (error instanceof ArgumentError) return argumentError(message, t, error);
	if (error instanceof UserError) return userError(message, t, error);

	const { client, logger } = container;
	// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
	if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
		logger.warn(`${getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		return sendTemporaryMessage(message, t(LanguageKeys.System.DiscordAbortError));
	}

	// Extract useful information about the DiscordAPIError
	if (error instanceof DiscordAPIError) {
		if (isSilencedError(message, error)) return;
		client.emit(Events.Error, error);
	} else {
		logger.warn(`${getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
	}

	// Send a detailed message:
	await sendErrorChannel(message, command, parameters, error);

	// Emit where the error was emitted
	logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
	try {
		await sendTemporaryMessage(message, generateUnexpectedErrorMessage(message.author.id, command, t, error));
	} catch (err) {
		client.emit(Events.Error, err);
	}

	return undefined;
}

function isSilencedError(message: Message, error: DiscordAPIError) {
	return (
		// If it's an unknown channel or an unknown message, ignore:
		ignoredCodes.includes(error.code as number) ||
		// If it's a DM message reply after a block, ignore:
		isDirectMessageReplyAfterBlock(message, error)
	);
}

function isDirectMessageReplyAfterBlock(message: Message, error: DiscordAPIError) {
	// When sending a message to a user who has blocked the bot, Discord replies with 50007 "Cannot send messages to this user":
	if (error.code !== RESTJSONErrorCodes.CannotSendMessagesToThisUser) return false;

	// If it's not a Direct Message, return false:
	if (message.guild !== null) return false;

	// If the query was made to the message's channel, then it was a DM response:
	return error.url === Routes.channelMessages(message.channel.id);
}

function stringError(message: Message, t: TFunction, error: string) {
	return alert(message, t(LanguageKeys.Events.Errors.String, { mention: message.author.toString(), message: error }));
}

function argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
	const argument = error.argument.name;
	const identifier = translate(error.identifier);
	const parameter = error.parameter.replaceAll('`', '῾');
	return alert(message, t(identifier, { ...error, ...(error.context as object), argument, parameter: cutText(parameter, 50) }));
}

function userError(message: Message, t: TFunction, error: UserError) {
	// `context: { silent: true }` should make UserError silent:
	// Use cases for this are for example permissions error when running the `eval` command.
	if (Reflect.get(Object(error.context), 'silent')) return;

	const identifier = translate(error.identifier);
	const content = t(identifier, error.context as any) as string;
	return alert(message, content);
}

function alert(message: Message, content: string) {
	return sendTemporaryMessage(message, { content, allowedMentions: { users: [message.author.id], roles: [] } });
}

async function sendErrorChannel(message: Message, command: Command, parameters: string, error: Error) {
	const webhook = container.client.webhookError;
	if (webhook === null) return;

	const lines = [getLinkLine(message.url), getCommandLine(command), getArgumentsLine(parameters), getErrorLine(error)];

	// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		lines.splice(2, 0, getPathLine(error), getCodeLine(error));
	}

	const embed = new EmbedBuilder().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp();
	try {
		await webhook.send({ embeds: [embed] });
	} catch (err) {
		container.client.emit(Events.Error, err);
	}
}

/**
 * Formats a message url line.
 * @param url The url to format.
 */
function getLinkLine(url: string): string {
	return `[**Jump to Message!**](${url})`;
}

/**
 * Formats a command line.
 * @param command The command to format.
 */
function getCommandLine(command: Command): string {
	return `**Command**: ${command.location.full.slice(rootFolder.length)}`;
}

/**
 * Formats an error path line.
 * @param error The error to format.
 */
function getPathLine(error: DiscordAPIError | HTTPError): string {
	return `**Path**: ${error.method.toUpperCase()} ${error.url}`;
}

/**
 * Formats an error code line.
 * @param error The error to format.
 */
function getCodeLine(error: DiscordAPIError | HTTPError): string {
	return `**Code**: ${'code' in error ? error.code : error.status}`;
}

/**
 * Formats an arguments line.
 * @param parameters The arguments the user used when running the command.
 */
function getArgumentsLine(parameters: string): string {
	if (parameters.length === 0) return '**Parameters**: Not Supplied';
	return `**Parameters**: [\`${parameters.trim().replaceAll('`', '῾') || ZeroWidthSpace}\`]`;
}

/**
 * Formats an error codeblock.
 * @param error The error to format.
 */
function getErrorLine(error: Error): string {
	return `**Error**: ${codeBlock('js', error.stack || error.toString())}`;
}

function getWarnError(message: Message) {
	return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
}
