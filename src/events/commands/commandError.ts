import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import type { SkyraCommand } from '#lib/structures';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { O, rootFolder } from '#utils/constants';
import { ArgumentError, Command, CommandErrorPayload, Event, UserError } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, HTTPError, Message, MessageEmbed } from 'discord.js';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserEvent extends Event<Events.CommandError> {
	// TODO(kyranet): Make CommandError emit more metadata
	public async run(error: Error, { message, piece }: CommandErrorPayload) {
		// If the error was a string or an UserError, send it to the user:
		if (typeof error === 'string') return this.stringError(message, error);
		if (error instanceof ArgumentError) return this.argumentError(message, error);
		if (error instanceof UserError) return this.userError(message, error);

		const { client } = this.context;
		// If the error was an AbortError, tell the user to re-try:
		if (error.name === 'AbortError') {
			client.logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			return message.alert(await message.resolveKey(LanguageKeys.System.DiscordAbortError));
		}

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (ignoredCodes.includes(error.code)) return;
			client.emit(Events.ApiError, error);
		} else {
			client.logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		}

		// Send a detailed message:
		const command = piece as SkyraCommand;
		await this.sendErrorChannel(message, command, error);

		// Emit where the error was emitted
		client.logger.fatal(`[COMMAND] ${command.path}\n${error.stack || error.message}`);
		try {
			await message.alert(
				OWNERS.includes(message.author.id) ? codeBlock('js', error.stack!) : await message.resolveKey(LanguageKeys.Events.Errors.Wtf)
			);
		} catch (err) {
			client.emit(Events.ApiError, err);
		}

		return undefined;
	}

	private async stringError(message: Message, error: string) {
		return this.alert(
			message,
			await message.resolveKey(LanguageKeys.Events.Errors.String, { mention: message.author.toString(), message: error })
		);
	}

	private async argumentError(message: Message, error: ArgumentError<unknown>) {
		const argument = error.argument.name;
		const identifier = translate(error.identifier);
		const parameter = error.parameter.replaceAll('`', '῾');
		return this.alert(message, await message.resolveKey(identifier, { ...error, ...(error.context as O), argument, parameter }));
	}

	private async userError(message: Message, error: UserError) {
		const identifier = translate(error.identifier);
		return this.alert(message, await message.resolveKey(identifier, error.context));
	}

	private async alert(message: Message, content: string) {
		return message.alert(content, { allowedMentions: { users: [message.author.id], roles: [] } });
	}

	private async sendErrorChannel(message: Message, command: Command, error: Error) {
		const lines = [
			this.getLinkLine(message.url),
			this.getCommandLine(command),
			// this.getArgumentsLine(message.args),
			this.getErrorLine(error)
		];

		// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			lines.splice(2, 0, this.getPathLine(error), this.getCodeLine(error));
		}

		try {
			await this.context.client.webhookError.send(new MessageEmbed().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp());
		} catch (err) {
			this.context.client.emit(Events.ApiError, err);
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
		return `**Command**: ${command.path.slice(rootFolder.length)}`;
	}

	/**
	 * Formats an error path line.
	 * @param error The error to format.
	 */
	private getPathLine(error: DiscordAPIError | HTTPError): string {
		return `**Path**: ${error.method.toUpperCase()} ${error.path}`;
	}

	/**
	 * Formats an error code line.
	 * @param error The error to format.
	 */
	private getCodeLine(error: DiscordAPIError | HTTPError): string {
		return `**Code**: ${error.code}`;
	}

	/**
	 * Formats an arguments line.
	 * @param args The arguments the user used when running the command.
	 */
	// private getArgumentsLine(args: readonly string[]): string {
	// 	if (args.length === 0) return '**Arguments**: Not Supplied';
	// 	return `**Arguments**: [\`${args.map((arg) => arg?.trim() || '\u200B').join('`, `')}\`]`;
	// }

	/**
	 * Formats an error codeblock.
	 * @param error The error to format.
	 */
	private getErrorLine(error: Error): string {
		return `**Error**: ${codeBlock('js', error.stack || error)}`;
	}

	private getWarnError(message: Message) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}
}
