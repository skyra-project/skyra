const { Event, DiscordAPIError, klasaUtil: { codeBlock } } = require('../index');
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
			this._sendErrorChannel(msg, command, error);
			this.client.emit('warn', `${this._getWarnError(msg, command, error)} (${msg.author.id}) | ${error.constructor.name}`);
			this.client.emit('wtf', `[COMMAND] ${join(command.dir, ...command.file)}\n${error.stack || error}`);
			msg.alert(msg.author === this.client.owner ? codeBlock('js', error.stack) : msg.language.get('EVENTS_ERROR_WTF'))
				.catch(this._handleMessageError);
		}
	}

	init() {
		this.logChannel = this.client.guilds.get('254360814063058944').channels.get('432495057552277504');
	}

	_sendErrorChannel(msg, command, error) {
		if (!this.logChannel) return;
		const isDiscordAPIError = error instanceof DiscordAPIError;
		this.logChannel.send(codeBlock('asciidoc', (isDiscordAPIError ? [
			`Command   :: ${join(command.dir, ...command.file)}`,
			`Path      :: ${error.path}`,
			`Code      :: ${error.code}`,
			`Location  :: ${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : `DM/${msg.author.id}`}/${msg.id}`,
			`Arguments :: ${msg.args.length ? `[${msg.args.join(command.usageDelim)}]` : 'Not Supplied'}`,
			`Error     :: ${error.stack || error}`
		] : [
			`Command   :: ${join(command.dir, ...command.file)}`,
			`Location  :: ${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : `DM/${msg.author.id}`}/${msg.id}`,
			`Arguments :: ${msg.args.length ? `[${msg.args.join(command.usageDelim)}]` : 'Not Supplied'}`,
			`Error     :: ${error.stack || error}`
		]).join('\n'))).catch(() => null);
	}

	_handleMessageError(sendError) {
		Error.captureStackTrace(sendError);
		this.client.emit('wtf', sendError);
	}

	_getWarnError(msg, command, error) {
		return `${error.code ? `[${error.code}] ` : ''}ERROR: /${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : `DM/${msg.author.id}`}/${msg.id}`;
	}

};
