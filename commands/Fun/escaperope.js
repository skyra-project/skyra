const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 60,
			description: (msg) => msg.language.get('COMMAND_ESCAPEROPE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_ESCAPEROPE_EXTENDED')
		});
	}

	async run(msg) {
		if (msg.deletable) msg.nuke().catch(() => null);
		return msg.send(msg.language.get('COMMAND_ESCAPEROPE_OUTPUT', msg.author));
	}

};
