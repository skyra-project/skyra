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
			return this.client.arguments.get('username').run(arg, possible, msg);
		});

		this.spam = true;
		this.busy = new Set();
	}

	async run(msg, [check, user]) {
		const now = Date.now();
		const userProfile = msg.author.configs;
		const targetProfile = (user && user.configs) || null;

		if (userProfile._syncStatus) await userProfile._syncStatus;

		if (check) {
			if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
			if (targetProfile && targetProfile._syncStatus) await targetProfile._syncStatus;
			return msg.sendMessage(msg.author === user
				? msg.language.get('COMMAND_REPUTATIONS_SELF', userProfile.reputation)
				: msg.language.get('COMMAND_REPUTATIONS', user.username, targetProfile.reputation));
		}

		if (this.busy.has(msg.author.id) || userProfile.timeReputation + DAY > now)
			return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_TIME', userProfile.timeReputation + DAY - now));


		if (!user) return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_USABLE'));
		if (user.bot) throw msg.language.get('COMMAND_REPUTATION_BOTS');
		if (user === msg.author) throw msg.language.get('COMMAND_REPUTATION_SELF');
		this.busy.add(msg.author.id);

		try {
			if (targetProfile && targetProfile._syncStatus) await targetProfile._syncStatus;
			await targetProfile.update('reputation', targetProfile.reputation + 1);
			await userProfile.update('timeReputation', now);
		} catch (err) {
			this.busy.delete(msg.author.id);
			throw err;
		}

		this.busy.delete(msg.author.id);
		return msg.sendMessage(msg.language.get('COMMAND_REPUTATION_GIVE', user.username));
	}

};
