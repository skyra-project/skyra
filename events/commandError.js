const { Event, util } = require('klasa');
const { join } = require('path');

module.exports = class extends Event {

	run(msg, command, params, error) {
		if (typeof error === 'string') {
			msg.alert(msg.language.get('EVENTS_ERROR_STRING', msg.author, error))
				.catch(sendError => this.client.emit('wtf', sendError));
		} else if (error instanceof Error) {
			this.client.emit('log', `${this._getWarnError(msg, error, command)} (${msg.author.id}) | ${error.constructor.name}`, 'warn');
			this.client.emit('wtf', `[COMMAND] ${join(command.dir, ...command.file)}\n${error.stack || error}`);
			msg.alert(msg.author === this.client.owner ? util.codeBlock('js', error.stack) : msg.language.get('EVENTS_ERROR_WTF'))
				.catch(sendError => this.client.emit('wtf', sendError));
		}
	}

	_getWarnError(msg, command, error) {
		return `${error.code ? `[${error.code}] ` : ''}ERROR: /${msg.guild ? `${msg.guild.id}/${msg.channel.id}` : 'DM'}/${msg.id}`;
	}

};
