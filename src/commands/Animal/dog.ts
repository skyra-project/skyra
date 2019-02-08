import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	private readonly ids = [
		'55991', '56020', '236567', '215795', '198588', '239388', '55709',
		'304011', '239386', '137479', '95278', '393154', '61910', '264155',
		'239389', '239395', '293551', '22761', '265279', '137000', '293552',
		'449188', '140491', '203497', '112888', '3058440', '371698', '277752',
		'179920', '96127', '261963', '106499'
	];
	private index = Math.ceil(Math.random() * this.ids.length);

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['doggo', 'puppy'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_DOG_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DOG_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		if (this.index >= this.ids.length - 1) this.index = 0;
		else this.index++;

		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${this.ids[this.index]}.jpg`)
			.setTimestamp());
	}

}
