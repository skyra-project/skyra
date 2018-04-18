const { Command, constants: { TIME: { DAY } } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rep'],
			bucket: 2,
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_REPUTATION_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_REPUTATION_EXTENDED'),
			quotedStringSupport: true,
			runIn: ['text'],
			usage: '[check] (user:username)',
			usageDelim: ' '
		});

		this.createCustomResolver('username', (arg, possible, msg) => {
			if (!arg || arg === '') return msg.author;
			return this.client.argResolver.cmd(arg, possible, msg);
		});

		this.spam = true;
		this.busy = new Set();
	}

	async run(msg, [check, user]) {
		if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');

		const now = Date.now();
		const profile = user.configs;
		if (profile._syncStatus) await profile._syncStatus;

		if (check) {
			return msg.sendMessage(msg.author === user
				? msg.language.get('COMMAND_REPUTATIONS_SELF', profile.reputation)
				: msg.language.get('COMMAND_REPUTATIONS', user.username, profile.reputation));
		}

		if (this.busy.has(msg.author.id) || profile.timeReputation + DAY > now) {
			return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_TIME', profile.timeReputation + DAY - now));
		}

		if (!user) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_USABLE'));
		if (user === msg.author) throw msg.language.get('COMMAND_REPUTATION_SELF');
		this.busy.add(msg.author.id);

		try {
			await profile.update('reputation', profile.reputation + 1);
			await profile.update('timeReputation', now);
		} catch (err) {
			this.busy.delete(msg.author.id);
			throw err;
		}

		this.busy.delete(msg.author.id);
		return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_GIVE', user.username));
	}

};
