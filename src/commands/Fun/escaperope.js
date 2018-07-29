const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 60,
			description: (msg) => msg.language.get('COMMAND_ESCAPEROPE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_ESCAPEROPE_EXTENDED')
		});
	}

	async run(msg) {
		if (msg.deletable) msg.nuke().catch(() => null);
		return msg.sendLocale('COMMAND_ESCAPEROPE_OUTPUT', [msg.author]);
	}

};
