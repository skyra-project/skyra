import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import type { SkyraArgs } from '#lib/structures';
import { OWNERS } from '#root/config';
import { Colors, ZeroWidthSpace, rootFolder } from '#utils/constants';
import { sendTemporaryMessage } from '#utils/functions';
import { Args, ArgumentError, Command, Events, Listener, UserError, type MessageCommandErrorPayload } from '@sapphire/framework';
import { codeBlock, cutText, type NonNullObject } from '@sapphire/utilities';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { RESTJSONErrorCodes, Routes } from 'discord-api-types/v10';
import { DiscordAPIError, EmbedBuilder, HTTPError, Message } from 'discord.js';
import type { TFunction } from 'i18next';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserListener extends Listener<typeof Events.MessageCommandError> {
	private readonly sentry = envIsDefined('SENTRY_URL');

	public async run(error: Error, { message, command, parameters, args: unknownArgs }: MessageCommandErrorPayload) {
		const args = unknownArgs as SkyraArgs;

		// If the error was a string or an UserError, send it to the user:
		if (typeof error === 'string') return this.stringError(message, args.t, error);
		if (error instanceof ArgumentError) return this.argumentError(message, args.t, error);
		if (error instanceof UserError) return this.userError(message, args.t, error);

		const { client, logger } = this.container;
		// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
		if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
			logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			return sendTemporaryMessage(message, args.t(LanguageKeys.System.DiscordAbortError));
		}

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError) {
			if (this.isSilencedError(args, error)) return;
			client.emit(Events.Error, error);
		} else {
			logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		}

		// Send a detailed message:
		await this.sendErrorChannel(message, command, parameters, error);

		// Emit where the error was emitted
		logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
		try {
			await sendTemporaryMessage(message, this.generateUnexpectedErrorMessage(args, error));
		} catch (err) {
			client.emit(Events.Error, err);
		}

		return undefined;
	}

	private isSilencedError(args: Args, error: DiscordAPIError) {
		return (
			// If it's an unknown channel or an unknown message, ignore:
			ignoredCodes.includes(error.code as number) ||
			// If it's a DM message reply after a block, ignore:
			this.isDirectMessageReplyAfterBlock(args, error)
		);
	}

	private isDirectMessageReplyAfterBlock(args: Args, error: DiscordAPIError) {
		// When sending a message to a user who has blocked the bot, Discord replies with 50007 "Cannot send messages to this user":
		if (error.code !== RESTJSONErrorCodes.CannotSendMessagesToThisUser) return false;

		// If it's not a Direct Message, return false:
		if (args.message.guild !== null) return false;

		// If the query was made to the message's channel, then it was a DM response:
		return error.url === Routes.channelMessages(args.message.channel.id);
	}

	private generateUnexpectedErrorMessage(args: Args, error: Error) {
		if (OWNERS.includes(args.message.author.id)) return codeBlock('js', error.stack!);
		if (!this.sentry) return args.t(LanguageKeys.Events.Errors.UnexpectedError);

		try {
			const report = captureException(error, { tags: { command: args.command.name } });
			return args.t(LanguageKeys.Events.Errors.UnexpectedErrorWithContext, { report });
		} catch (error) {
			this.container.client.emit(Events.Error, error);
			return args.t(LanguageKeys.Events.Errors.UnexpectedError);
		}
	}

	private stringError(message: Message, t: TFunction, error: string) {
		return this.alert(message, t(LanguageKeys.Events.Errors.String, { mention: message.author.toString(), message: error }));
	}

	private argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
		const argument = error.argument.name;
		const identifier = translate(error.identifier);
		const parameter = error.parameter.replaceAll('`', '῾');
		return this.alert(message, t(identifier, { ...error, ...(error.context as NonNullObject), argument, parameter: cutText(parameter, 50) }));
	}

	private userError(message: Message, t: TFunction, error: UserError) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);
		const content = t(identifier, error.context as any) as string;
		return this.alert(message, content);
	}

	private alert(message: Message, content: string) {
		return sendTemporaryMessage(message, { content, allowedMentions: { users: [message.author.id], roles: [] } });
	}

	private async sendErrorChannel(message: Message, command: Command, parameters: string, error: Error) {
		const webhook = this.container.client.webhookError;
		if (webhook === null) return;

		const lines = [this.getLinkLine(message.url), this.getCommandLine(command), this.getArgumentsLine(parameters), this.getErrorLine(error)];

		// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			lines.splice(2, 0, this.getPathLine(error), this.getCodeLine(error));
		}

		const embed = new EmbedBuilder().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp();
		try {
			await webhook.send({ embeds: [embed] });
		} catch (err) {
			this.container.client.emit(Events.Error, err);
		}
	}

	/**
	 * Formats a message url line.
	 * @param url The url to format.
	 */
	private getLinkLine(url: string): string {
		return `[**Jump to Message!**](${url})`;
	}

	/**
	 * Formats a command line.
	 * @param command The command to format.
	 */
	private getCommandLine(command: Command): string {
		return `**Command**: ${command.location.full.slice(rootFolder.length)}`;
	}

	/**
	 * Formats an error path line.
	 * @param error The error to format.
	 */
	private getPathLine(error: DiscordAPIError | HTTPError): string {
		return `**Path**: ${error.method.toUpperCase()} ${error.url}`;
	}

	/**
	 * Formats an error code line.
	 * @param error The error to format.
	 */
	private getCodeLine(error: DiscordAPIError | HTTPError): string {
		return `**Code**: ${'code' in error ? error.code : error.status}`;
	}

	/**
	 * Formats an arguments line.
	 * @param parameters The arguments the user used when running the command.
	 */
	private getArgumentsLine(parameters: string): string {
		if (parameters.length === 0) return '**Parameters**: Not Supplied';
		return `**Parameters**: [\`${parameters.trim().replaceAll('`', '῾') || ZeroWidthSpace}\`]`;
	}

	/**
	 * Formats an error codeblock.
	 * @param error The error to format.
	 */
	private getErrorLine(error: Error): string {
		return `**Error**: ${codeBlock('js', error.stack || error.toString())}`;
	}

	private getWarnError(message: Message) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}
}
