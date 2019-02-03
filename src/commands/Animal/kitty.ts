import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	private readonly ids = [
		'77227', '60575', '202462', '164687', '344049', '112786', '103656',
		'384799', '207142', '73164', '42265', '60578', '94171', '78621',
		'138232', '60533', '73165', '54706', '32208', '25687', '20627',
		'64954', '136661', '340024', '447939', '457236', '426098', '180398',
		'313993', '230590', '100241', '54708', '306710', '32510', '344001'
	];

	private index = Math.ceil(Math.random() * this.ids.length);

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['kitten', 'cat'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_KITTY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_KITTY_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});

	}

	public async run(message: KlasaMessage) {
		if (this.index > this.ids.length - 1) this.index = 0;
		else this.index += 1;

		return message.sendEmbed(new MessageEmbed()
			.setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${this.ids[this.index]}.jpg`));
	}

}
