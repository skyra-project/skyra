import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import type { SkyraCommand } from '#lib/structures';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { O, rootFolder, ZeroWidthSpace } from '#utils/constants';
import { ArgumentError, Command, CommandErrorPayload, Event, UserError } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, HTTPError, Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserEvent extends Event<Events.CommandError> {
	public async run(error: Error, { message, piece, parameters, args }: CommandErrorPayload) {
		// If the error was a string or an UserError, send it to the user:
		if (typeof error === 'string') return this.stringError(message, args.t, error);
		if (error instanceof ArgumentError) return this.argumentError(message, args.t, error);
		if (error instanceof UserError) return this.userError(message, args.t, error);

		const { client } = this.context;
		// If the error was an AbortError, tell the user to re-try:
		if (error.name === 'AbortError') {
			client.logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			return message.alert(args.t(LanguageKeys.System.DiscordAbortError));
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
		await this.sendErrorChannel(message, command, parameters, error);

		// Emit where the error was emitted
		client.logger.fatal(`[COMMAND] ${command.path}\n${error.stack || error.message}`);
		try {
			await message.alert(OWNERS.includes(message.author.id) ? codeBlock('js', error.stack!) : args.t(LanguageKeys.Events.Errors.Wtf));
		} catch (err) {
			client.emit(Events.ApiError, err);
		}

		return undefined;
	}

	private stringError(message: Message, t: TFunction, error: string) {
		return this.alert(message, t(LanguageKeys.Events.Errors.String, { mention: message.author.toString(), message: error }));
	}

	private argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
		const argument = error.argument.name;
		const identifier = translate(error.identifier);
		const parameter = error.parameter.replaceAll('`', '῾');
		return this.alert(message, t(identifier, { ...error, ...(error.context as O), argument, parameter }));
	}

	private userError(message: Message, t: TFunction, error: UserError) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);
		return this.alert(message, t(identifier, error.context as any));
	}

	private async alert(message: Message, content: string) {
		return message.alert(content, { allowedMentions: { users: [message.author.id], roles: [] } });
	}

	private async sendErrorChannel(message: Message, command: Command, parameters: string, error: Error) {
		const lines = [this.getLinkLine(message.url), this.getCommandLine(command), this.getArgumentsLine(parameters), this.getErrorLine(error)];

		// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			lines.splice(2, 0, this.getPathLine(error), this.getCodeLine(error));
		}

		try {
			await this.context.client.webhookError?.send(new MessageEmbed().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp());
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
		return `**Error**: ${codeBlock('js', error.stack || error)}`;
	}

	private getWarnError(message: Message) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}
}
