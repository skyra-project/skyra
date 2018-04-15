const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['reps'],
			bucket: 2,
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_REPUTATIONS_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_REPUTATIONS_EXTENDED'),
			usage: '[user:username]'
		});
		this.spam = true;
	}

	async run(msg, [user = msg.author]) {
		if (user.bot) throw msg.language.get('COMMAND_REPUTATIONS_BOTS');

		if (user.configs._syncStatus) await user.configs._syncStatus;
		return msg.author === user
			? msg.sendMessage(msg.language.get('COMMAND_REPUTATIONS_SELF', user.configs.reputation))
			: msg.sendMessage(msg.language.get('COMMAND_REPUTATIONS', user.username, user.configs.reputation));
	}

};
