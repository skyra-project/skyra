import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['a', 'av', 'ava'],
			cooldown: 15,
			description: language => language.tget('COMMAND_AVATAR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_AVATAR_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(user:username)'
		});

		this.createCustomResolver('username', (arg, possible, msg) =>
			arg ? this.client.arguments.get('username').run(arg, possible, msg) : msg.author);
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (!user.avatar) throw message.language.tget('COMMAND_AVATAR_NONE');
		return message.sendEmbed(new MessageEmbed()
			.setAuthor(user.tag, user.avatarURL({ size: 128 })!)
			.setColor(getColor(message) || 0xFFAB2D)
			.setImage(user.avatarURL({ size: 2048 })!));
	}

}
