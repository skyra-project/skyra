import { DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import { Command, Event, KlasaMessage, util } from 'klasa';
import { Events } from '../lib/types/Enums';
import { inlineCodeblock } from '../lib/util/util';
import { rootFolder } from '../lib/util/constants';

const BLACKLISTED_CODES = [
	// Unknown Channel
	10003,
	// Unknown Message
	10008
];

export default class extends Event {

	public async run(message: KlasaMessage, command: Command, _: string[], error: Error) {
		if (typeof error === 'string') {
			try {
				await message.alert(message.language.tget('EVENTS_ERROR_STRING', message.author.toString(), error));
			} catch (err) {
				this.client.emit(Events.ApiError, err);
			}
		} else if (error instanceof Error) {
			await this._sendErrorChannel(message, command, error);

			// Extract useful information about the DiscordAPIError
			if (error instanceof DiscordAPIError || error instanceof HTTPError) {
				if (BLACKLISTED_CODES.includes(error.code)) return;
				this.client.emit(Events.ApiError, error);
			} else {
				this.client.emit(Events.Warn, `${this._getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			}

			// Emit where the error was emitted
			this.client.emit(Events.Wtf, `[COMMAND] ${command.path}\n${error.stack || error}`);
			try {
				await message.alert(this.client.options.owners.includes(message.author.id)
					? util.codeBlock('js', error.stack!)
					: message.language.tget('EVENTS_ERROR_WTF'));
			} catch (err) {
				this.client.emit(Events.ApiError, err);
			}
		}
	}

	private async _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		let output: string;
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			output = [
				`${inlineCodeblock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeblock('Path      ::')} ${error.path}`,
				`${inlineCodeblock('Code      ::')} ${error.code}`,
				`${inlineCodeblock('Arguments ::')} ${message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'}`,
				`${inlineCodeblock('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		} else {
			output = [
				`${inlineCodeblock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeblock('Arguments ::')} ${message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'}`,
				`${inlineCodeblock('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		}

		try {
			await this.client.webhookError.send(new MessageEmbed()
				.setDescription(output)
				.setColor(0xFC1020)
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 64 }), message.url)
				.setTimestamp());
		} catch (err) {
			this.client.emit(Events.ApiError, err);
		}
	}

	private _getWarnError(message: KlasaMessage) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}

}
