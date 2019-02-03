import { DiscordAPIError, HTTPError, MessageEmbed } from 'discord.js';
import { Command, Event, KlasaMessage, util } from 'klasa';

export default class extends Event {

	public run(message: KlasaMessage, command: Command, _: string[], error: Error) {
		if (typeof error === 'string') {
			message.alert(message.language.get('EVENTS_ERROR_STRING', message.author, error))
				.catch((err) => this.client.emit('wtf', err));
		} else if (error instanceof Error) {
			// tslint:disable-next-line:no-floating-promises
			this._sendErrorChannel(message, command, error);

			// Extract useful information about the DiscordAPIError
			if (error instanceof DiscordAPIError || error instanceof HTTPError)
				this.client.emit('apiError', error);
			else
				this.client.emit('warn', `${this._getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);

			// Emit where the error was emitted
			this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
			message.alert(message.author.id === this.client.options.ownerID ? util.codeBlock('js', error.stack) : message.language.get('EVENTS_ERROR_WTF'))
				.catch((err) => this.client.emit('wtf', err));
		}
	}

	private _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		let output: string;
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			output = [
				`\`Command   ::\` ${command.path}`,
				`\`Path      ::\` ${error.path}`,
				`\`Code      ::\` ${error.code}`,
				`\`Location  ::\` ${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`,
				`\`Arguments ::\` ${message.args.length ? `[${message.args.join(command.usageDelim)}]` : 'Not Supplied'}`,
				`\`Error     ::\` ${error.stack || error}`
			].join('\n');
		} else {
			output = [
				`\`Command   ::\` ${command.path}`,
				`\`Location  ::\` ${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`,
				`\`Arguments ::\` ${message.args.length ? `[${message.args.join(command.usageDelim)}]` : 'Not Supplied'}`,
				`\`Error     ::\` ${error.stack || error}`
			].join('\n');
		}

		return this.client.webhookError.send(new MessageEmbed()
			.setDescription(output)
			.setAuthor(message.author.username, message.author.displayAvatarURL(), message.url)
			.setTimestamp())
			.catch((err) => this.client.emit('apiError', err));
	}

	private _getWarnError(message: KlasaMessage) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}

}
