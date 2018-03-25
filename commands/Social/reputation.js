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
		this.busy = new Set();
	}

	async run(msg, [user]) {
		const now = Date.now();
		const profile = msg.author.configs;

		if (this.busy.has(msg.author.id) || profile.timeReputation + DAY > now) {
			return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_TIME', profile.timeReputation + DAY - now));
		}

		if (!user) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_USABLE'));
		if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
		if (user === msg.author) throw msg.language.get('COMMAND_REPUTATION_SELF');
		this.busy.add(msg.author.id);

		try {
			if (user.configs._syncStatus) await user.configs._syncStatus;
			await user.configs.update('reputation', user.configs.reputation + 1);
			await msg.author.configs.update('timeReputation', now);
		} catch (err) {
			this.busy.delete(msg.author.id);
			throw err;
		}

		this.busy.delete(msg.author.id);
		return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_GIVE', user.username));
	}

};
