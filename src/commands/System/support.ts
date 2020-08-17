import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['support-server', 'server'],
			description: (language) => language.get('COMMAND_SUPPORT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SUPPORT_EXTENDED'),
			guarded: true,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		return message.sendEmbed(
			new MessageEmbed()
				.setTitle(message.language.get('COMMAND_SUPPORT_EMBED_TITLE', { username: message.author.username }))
				.setDescription(message.language.get('COMMAND_SUPPORT_EMBED_DESCRIPTION'))
				.setColor(await DbSet.fetchColor(message))
		);
	}
}
