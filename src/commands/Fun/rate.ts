const { Command, util, discordUtil: { escapeMarkdown } } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_RATE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_RATE_EXTENDED'),
			usage: '<user:string>'
		});
		this.spam = true;
	}

	public async run(msg, [user]) {
		// Escape all markdown
		user = escapeMarkdown(user);

		let ratewaifu;
		let rate;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = msg.language.get('COMMAND_RATE_MYSELF');
		} else {
			if (/^(myself|me)$/i.test(user)) user = msg.author.username;
			else user = user.replace(/\bmy\b/g, 'your');

			const rng = Math.round(Math.random() * 100);
			[ratewaifu, rate] = [util.oneToTen((rng / 10) | 0).emoji, rng];
		}

		return msg.sendMessage(`**${msg.author.username}**, ${msg.language.get('COMMAND_RATE_OUTPUT', user, rate, ratewaifu)}`, { disableEveryone: true });
	}

};
