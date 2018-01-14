const { Command } = require('klasa');
const { util } = require.main.exports;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_RATE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_RATE_EXTENDED'),
			usage: '<user:string>'
		});
		this.spam = true;
	}

	async run(msg, [user]) {
		let ratewaifu;
		let rate;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = msg.language.get('COMMAND_RATE_MYSELF');
		} else {
			if (/^(myself|me)$/i.test(user)) user = msg.author.username;
			else user = user.replace(/\bmy\b/g, 'your');

			const bg = Buffer.from(user.toLowerCase()).readUIntBE(0, user.length);
			const rng = user.length * Math.abs(Math.sin(bg)) * 10;
			rate = 100 - Math.round((bg * rng) % 100);
			ratewaifu = util.oneToTen(Math.floor(rate / 10)).emoji;
		}

		return msg.send(`**${msg.author.username}**, ${msg.language.get('COMMAND_RATE_OUTPUT', user, rate, ratewaifu)}`);
	}

};
