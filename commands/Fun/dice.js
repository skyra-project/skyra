const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: (msg) => msg.language.get('COMMAND_DICE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_DICE_EXTENDED'),
			usage: '[rolls:integer{1,1024}] [sides:integer{4,1024}]',
			usageDelim: ' '
		});
		this.spam = true;
	}

	async run(msg, [rl = 1, sd = 6]) {
		return msg.sendMessage(msg.language.get('COMMAND_DICE_OUTPUT', sd, rl, this.roll(rl, sd)));
	}

	roll(rolls, sides) {
		let total = 0;
		for (let i = 0; i < rolls; i++) total += Math.floor(Math.random() * (sides + 1));
		return total;
	}

};
