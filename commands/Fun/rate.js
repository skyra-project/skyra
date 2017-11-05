const { structures: { Command }, util: { constants } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			spam: true,

			cooldown: 10,

			usage: '<user:string>',
			description: 'Let bots have opinions and rate somebody.',
			extend: {
				EXPLANATION: [
					'Just because I am a bot doesn\'t mean I cannot rate you properly. I can grade you with a random number',
					'generator to ease the process. Okay okay, it\'s not fair, but I mean... I can also give you a 💯.'
				].join(' '),
				ARGUMENTS: '<user>',
				EXP_USAGE: [
					['user', 'A user to rate.']
				],
				EXAMPLES: ['Skyra', 'Microsoft']
			}
		});
	}

	async run(msg, [user], settings, i18n) {
		let ratewaifu;
		let rate;

		if (/^(you|yourself|skyra)$/i.test(user)) {
			rate = 100;
			[ratewaifu, user] = i18n.get('COMMAND_RATE_MYSELF');
		} else {
			if (/^(myself|me)$/i.test(user)) user = msg.author.username;
			else user = user.replace(/\bmy\b/g, 'your');

			const bg = Buffer.from(user.toLowerCase()).readUIntBE(0, user.length);
			const rng = user.length * Math.abs(Math.sin(bg)) * 10;
			rate = 100 - Math.round((bg * rng) % 100);
			ratewaifu = constants.oneToTen(Math.floor(rate / 10)).emoji;
		}

		return msg.send(`**${msg.author.username}**, ${i18n.get('COMMAND_RATE', user, rate, ratewaifu)}`);
	}

};
