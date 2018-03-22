const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: (msg) => msg.language.get('COMMAND_DICE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_DICE_EXTENDED'),
			usage: '[rolls:integer{1,1024}] [sides:integer{4,1024}]',
			usageDelim: ' '
		});

		this.createCustomResolver('rolls', (arg, possible, msg) => {
			if (!arg || arg === '') return undefined;
			const number = Number(arg);
			if (isNaN(number) || number < 1 || number > 1024) throw msg.language.get('COMMAND_DICE_ROLLS_ERROR');
			return number | 0;
		}).createCustomResolver('sides', (arg, possible, msg) => {
			if (!arg || arg === '') return undefined;
			const number = Number(arg);
			if (isNaN(number) || number < 4 || number > 1024) throw msg.language.get('COMMAND_DICE_SIDES_ERROR');
			return number | 0;
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
