const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['kitten', 'cat'],
			botPerms: ['EMBED_LINKS'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_KITTY_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_KITTY_EXTENDED')
		});

		this.rand = [
			'77227', '60575', '202462', '164687', '344049', '112786', '103656',
			'384799', '207142', '73164', '42265', '60578', '94171', '78621',
			'138232', '60533', '73165', '54706', '32208', '25687', '20627',
			'64954', '136661', '340024', '447939', '457236', '426098', '180398',
			'313993', '230590', '100241', '54708', '306710', '32510', '344001'
		];

		this.spam = true;
		this.index = Math.ceil(Math.random() * this.rand.length);
	}

	async run(msg) {
		if (this.index >= this.rand.length - 1) this.index = 0;
		else this.index += 1;

		const embed = new this.client.methods.Embed()
			.setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${this.rand[this.index]}.jpg`);

		return msg.sendEmbed(embed);
	}

};
