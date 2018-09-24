const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_DICE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DICE_EXTENDED'),
			usage: '(rolls:rolls) (sides:sides)',
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

	run(msg, [rl = 1, sd = 6]) {
		return msg.sendLocale('COMMAND_DICE_OUTPUT', [sd, rl, this.roll(rl, sd)]);
	}

	roll(rolls, sides) {
		let total = 0;
		for (let i = 0; i < rolls; i++) total += Math.floor(Math.random() * (sides + 1));
		return total;
	}

};
