const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 2,
			cooldown: 30,

			description: 'Runs a connection test to Discord.'
		});
	}

	async run(msg, params, settings, i18n) {
		const message = await msg.send(i18n.get('COMMAND_PING'));
		return message.edit(i18n.get('COMMAND_PINGPONG', message.createdTimestamp - msg.createdTimestamp, Math.round(this.client.ping)));
	}

};
