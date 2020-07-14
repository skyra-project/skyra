import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

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
			arg ? this.client.arguments.get('username')!.run(arg, possible, msg) : msg.author);
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (!user.avatar) throw message.language.tget('COMMAND_AVATAR_NONE');

		return message.sendEmbed(new MessageEmbed()
			.setAuthor(user.tag, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setColor(await DbSet.fetchColor(message))
			.setImage(user.displayAvatarURL({ size: 2048, format: 'png', dynamic: true })));
	}

}
