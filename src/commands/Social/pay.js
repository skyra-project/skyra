const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_PAY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PAY_EXTENDED'),
			runIn: ['text'],
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
		this.spam = true;
	}

	async run(msg, [money, user]) {
		if (msg.author === user) throw msg.language.get('COMMAND_PAY_SELF');
		if (user.bot) return msg.sendLocale('COMMAND_SOCIAL_PAY_BOT');

		if (money <= 0) throw msg.language.get('RESOLVER_POSITIVE_AMOUNT');

		await msg.author.settings.waitSync();
		if (msg.author.settings.money < money) throw msg.language.get('COMMAND_PAY_MISSING_MONEY', money, msg.author.settings.money);

		const accepted = await msg.ask(msg.language.get('COMMAND_PAY_PROMPT', user.username, money));
		return accepted ? this.acceptPayment(msg, user, money) : this.denyPayment(msg);
	}

	async acceptPayment(msg, user, money) {
		await user.settings.waitSync();
		await msg.author.settings.use(money);
		await user.settings.add(money);
		return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_ACCEPT', user.username, money));
	}

	denyPayment(msg) {
		return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_DENY'));
	}

};
