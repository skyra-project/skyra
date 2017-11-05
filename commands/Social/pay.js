const { structures: { Command } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			mode: 1,
			spam: true,
			cooldown: 10,

			usage: '<amount:int> <user:user>',
			usageDelim: ' ',
			description: 'Pay somebody with your shinies.',
			extendedHelp: Command.strip`
                Businessmen! Today is payday!

                ⚙ | ***Explained usage***
                Skyra, pay [money] [user]
                Money :: Amount of shinies to pay, you must have the amount you are going to pay.
                User  :: The targetted user to pay. (Must be mention/id)

                🔗 | ***Examples***
                • Skyra, pay 200 @kyra
                    I will get 200 shinies from your bank and give them to the user.
            `
		});
	}

	async run(msg, [money, user], settings, i18n) {
		if (msg.author.id === user.id)
			throw i18n.get('COMMAND_PAY_SELF');

		if (money <= 0)
			throw i18n.get('RESOLVER_POSITIVE_AMOUNT');

		if (msg.author.profile.money < money)
			throw i18n.get('COMMAND_PAY_MISSING_MONEY', money, msg.author.profile.money, Command.shiny(msg));

		if (user.bot)
			return msg.send(i18n.get('COMMAND_SOCIAL_PAY_BOT'));

		return msg.prompt(i18n.get('COMMAND_PAY_PROMPT', user.username, money, Command.shiny(msg)))
			.then(() => this.acceptPayment(msg, user, money, i18n))
			.catch(() => this.denyPayment(msg, i18n));
	}

	async acceptPayment(msg, user, money, i18n) {
		const userProfile = msg.author.profile;
		if (userProfile.money < money)
			throw i18n.get('COMMAND_PAY_MISSING_MONEY', money, userProfile, Command.shiny(msg));

		await userProfile.use(money).catch(Command.handleError);
		await user.profile.add(money).catch(Command.handleError);
		return msg.alert(i18n.get('COMMAND_PAY_PROMPT_ACCEPT', user.username, money, Command.shiny(msg)));
	}

	async denyPayment(msg, i18n) {
		return msg.alert(i18n.get('COMMAND_PAY_PROMPT_DENY'));
	}

};
