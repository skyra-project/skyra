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

		this.createCustomResolver('username', (arg, possible, msg, [check]) => {
			if (!arg) return check ? msg.author : undefined;
			return this.client.argResolver.username(arg, possible, msg);
		});

		this.spam = true;
		this.busy = new Set();
	}

	async run(msg, [check, user]) {
		const now = Date.now();
		const profile = (user || msg.author).configs;
		if (profile._syncStatus) await profile._syncStatus;

		if (check) {
			if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
			return msg.sendMessage(msg.author === user
				? msg.language.get('COMMAND_REPUTATIONS_SELF', profile.reputation)
				: msg.language.get('COMMAND_REPUTATIONS', user.username, profile.reputation));
		}

		if (this.busy.has(msg.author.id) || profile.timeReputation + DAY > now) {
			return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_TIME', profile.timeReputation + DAY - now));
		}

		if (!user) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_USABLE'));
		if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
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
