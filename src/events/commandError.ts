const { Event, DiscordAPIError, klasaUtil: { codeBlock } } = require('../index');

module.exports = class extends Event {

	constructor(client, store, file, directory) {
		super(client, store, file, directory);
		this.logChannel = null;
	}

	run(msg, command, params, error) {
		if (typeof error === 'string') {
			msg.alert(msg.language.get('EVENTS_ERROR_STRING', msg.author, error))
				.catch(this._handleMessageError);
		} else if (error instanceof Error) {
			this._sendErrorChannel(msg, command, error);

			// Extract useful information about the DiscordAPIError
			if (error instanceof DiscordAPIError)
				this.client.emit('apiError', error);
			else
				this.client.emit('warn', `${this._getWarnError(msg, command, error)} (${msg.author.id}) | ${error.constructor.name}`);


			// Emit where the error was emitted
			this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
			msg.alert(msg.author === this.client.owner ? codeBlock('js', error.stack) : msg.language.get('EVENTS_ERROR_WTF'))
				.catch(this._handleMessageError);
		}
	}

	async init() {
		this.logChannel = this.client.guilds.get('254360814063058944').channels.get('432495057552277504');
	}

	_sendErrorChannel(msg, command, error) {
		if (!this.logChannel) return;
		const isDiscordAPIError = error instanceof DiscordAPIError;
		// @ts-ignore
		this.logChannel.send(codeBlock('asciidoc', (isDiscordAPIError ? [
			`Command   :: ${command.path}`,
			`Path      :: ${error.path}`,
			`Code      :: ${error.code}`,
			`Location  :: ${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : `DM/${msg.author.id}`}/${msg.id}`,
			`Arguments :: ${msg.args.length ? `[${msg.args.join(command.usageDelim)}]` : 'Not Supplied'}`,
			`Error     :: ${error.stack || error}`
		] : [
			`Command   :: ${command.path}`,
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
