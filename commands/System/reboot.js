const { structures: { Command } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['restart'],
			permLevel: 10,
			mode: 2,

			description: 'Reboot the bot.'
		});
	}

	async run(msg, params, settings, i18n) {
		await msg.send(i18n.get('COMMAND_REBOOT'))
			.catch(() => null);

		process.exit();
	}

};
