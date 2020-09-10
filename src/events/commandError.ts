import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { codeBlock, inlineCodeBlock } from '@sapphire/utilities';
import { rootFolder } from '@utils/constants';
import { DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import { Command, Event, KlasaMessage } from 'klasa';

const BLACKLISTED_CODES = [
	// Unknown Channel
	10003,
	// Unknown Message
	10008
];

export default class extends Event {
	public async run(message: KlasaMessage, command: Command, _: string[], error: string | Error) {
		// If the error was a string (message from Skyra to not fire inhibitors), send it:
		if (typeof error === 'string') {
			try {
				return await message.alert(message.language.get('eventsErrorString', { mention: message.author.toString(), message: error }), {
					allowedMentions: { users: [message.author.id], roles: [] }
				});
			} catch (err) {
				return this.client.emit(Events.ApiError, err);
			}
		}

		// If the error was an AbortError, tell the user to re-try:
		if (error.name === 'AbortError') {
			this.client.emit(Events.Warn, `${this._getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			try {
				return await message.alert(message.language.get('systemDiscordAborterror'));
			} catch (err) {
				return this.client.emit(Events.ApiError, err);
			}
		}

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (BLACKLISTED_CODES.includes(error.code)) return;
			this.client.emit(Events.ApiError, error);
		} else {
			this.client.emit(Events.Warn, `${this._getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		}

		// Send a detailed message:
		await this._sendErrorChannel(message, command, error);

		// Emit where the error was emitted
		this.client.emit(Events.Wtf, `[COMMAND] ${command.path}\n${error.stack || error.message}`);
		try {
			await message.alert(
				this.client.options.owners.includes(message.author.id) ? codeBlock('js', error.stack!) : message.language.get('eventsErrorWtf')
			);
		} catch (err) {
			this.client.emit(Events.ApiError, err);
		}
	}

	private async _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		let output: string | undefined = undefined;
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			output = [
				`${inlineCodeBlock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeBlock('Path      ::')} ${error.path}`,
				`${inlineCodeBlock('Code      ::')} ${error.code}`,
				`${inlineCodeBlock('Arguments ::')} ${message.args.length ? `[\`${message.args.join('`, `')}\`]` : 'Not Supplied'}`,
				`${inlineCodeBlock('Error     ::')} ${codeBlock('js', error.stack || error)}`
			].join('\n');
		} else {
			output = [
				`${inlineCodeBlock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeBlock('Arguments ::')} ${message.args.length ? `[\`${message.args.join('`, `')}\`]` : 'Not Supplied'}`,
				`${inlineCodeBlock('Error     ::')} ${codeBlock('js', error.stack || error)}`
			].join('\n');
		}

		try {
			await this.client.webhookError.send(
				new MessageEmbed()
					.setDescription(output)
					.setColor(Colors.Red)
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }), message.url)
					.setTimestamp()
			);
		} catch (err) {
			this.client.emit(Events.ApiError, err);
		}
	}

	private _getWarnError(message: KlasaMessage) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}
}
