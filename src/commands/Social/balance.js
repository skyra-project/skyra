const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['bal', 'credits'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_BALANCE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_BALANCE_EXTENDED'),
			usage: '[user:username]'
		});
		this.spam = true;
	}

	async run(msg, [user = msg.author]) {
		if (user.bot) throw msg.language.get('COMMAND_BALANCE_BOTS');

		await user.settings.waitSync();
		return msg.author === user
			? msg.sendLocale('COMMAND_BALANCE_SELF', [user.settings.money])
			: msg.sendLocale('COMMAND_BALANCE', [user.username, user.settings.money]);
	}

};
