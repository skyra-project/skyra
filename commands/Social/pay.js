const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_PAY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_PAY_EXTENDED'),
			runIn: ['text'],
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
		this.spam = true;
	}

	async run(msg, [money, user]) {
		if (msg.author === user) throw msg.language.get('COMMAND_PAY_SELF');
		if (user.bot) return msg.sendMessage(msg.language.get('COMMAND_SOCIAL_PAY_BOT'));

		if (money <= 0) throw msg.language.get('RESOLVER_POSITIVE_AMOUNT');

		if (msg.author.configs._syncStatus) await msg.author.configs._syncStatus;
		if (msg.author.configs.money < money) throw msg.language.get('COMMAND_PAY_MISSING_MONEY', money, msg.author.configs.money);

		const accepted = await msg.ask(msg.language.get('COMMAND_PAY_PROMPT', user.username, money));
		return accepted ? this.acceptPayment(msg, user, money) : this.denyPayment(msg);
	}

	async acceptPayment(msg, user, money) {
		if (user.configs._syncStatus) await user.configs._syncStatus;
		await msg.author.configs.use(money);
		await user.configs.add(money);
		return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_ACCEPT', user.username, money));
	}

	denyPayment(msg) {
		return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_DENY'));
	}

};
