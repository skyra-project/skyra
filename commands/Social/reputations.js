const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['reps'],
			bucket: 2,
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_REPUTATIONS_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_REPUTATIONS_EXTENDED')
		});
		this.spam = true;
	}

	run(msg) {
		return msg.sendMessage(msg.language.get('COMMAND_REPUTATIONS', msg.author.configs.reputation));
	}

};
