const { Event } = require('../index');
const { DiscordAPIError } = require('discord.js');
const { join } = require('path');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);
		this.logChannel = null;
	}

	run(msg, command, params, error) {
		if (typeof error === 'string') {
			msg.alert(msg.language.get('EVENTS_ERROR_STRING', msg.author, error))
				.catch(this._handleMessageError);
		} else if (error instanceof Error) {
			if (error instanceof DiscordAPIError) Error.captureStackTrace(error);
			this._sendErrorChannel(command, error);
			this.client.emit('warn', `${this._getWarnError(msg, command, error)} (${msg.author.id}) | ${error.constructor.name}`);
			this.client.emit('wtf', `[COMMAND] ${join(command.dir, ...command.file)}\n${error.stack || error}`);
			msg.alert(msg.author === this.client.owner ? this.client.methods.util.codeBlock('js', error.stack) : msg.language.get('EVENTS_ERROR_WTF'))
				.catch(this._handleMessageError);
		}
	}

	init() {
		this.logChannel = this.client.guilds.get('254360814063058944').channels.get('432495057552277504');
	}

	_sendErrorChannel(command, error) {
		if (!this.logChannel) return;
		const isDiscordAPIError = error instanceof DiscordAPIError;
		const header = this.client.methods.util.codeBlock('js',
			`[COMMAND]${join(command.dir, ...command.file)}${(isDiscordAPIError ? `Path: ${error.path}\n` : '')}${this._getWarnError}`);
		const content = this.client.methods.util.codeBlock('js',
			error.stack || error);
		this.logChannel.send(header + content)
			.catch(() => null);
	}

	_handleMessageError(sendError) {
		Error.captureStackTrace(sendError);
		this.client.emit('wtf', sendError);
	}

	_getWarnError(msg, command, error) {
		return `${error.code ? `[${error.code}] ` : ''}ERROR: /${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : `DM/${msg.author.id}`}/${msg.id}`;
	}

};
