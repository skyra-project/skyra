const { Command, constants: { TIME: { DAY } } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rep'],
			bucket: 2,
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_REPUTATION_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_REPUTATION_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});
		this.spam = true;
	}

	async run(msg, [user]) {
		const now = Date.now();
		const profile = msg.author.configs;

		if (profile.timerep + DAY > now) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_TIME', profile.timeReputation + DAY - now));

		if (!user) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_USABLE'));
		if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
		if (user === msg.author) throw msg.language.get('COMMAND_REPUTATION_SELF');

		if (user.configs._syncStatus) await user.configs._syncStatus;
		await user.configs.update('reputation', user.configs.reputation + 1);
		await msg.author.configs.update('timerep', now);
		return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_GIVE', user.username));
	}

};
