const { structures: { Command } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 2,
			cooldown: 5,

			description: 'Displays the join server link of the bot.'
		});
	}

	run(msg, params, settings, i18n) {
		return msg.send(i18n.get('COMMAND_INVITE', this.client.invite));
	}

};
