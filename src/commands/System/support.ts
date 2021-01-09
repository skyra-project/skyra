import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['support-server', 'server'],
			description: LanguageKeys.Commands.System.SupportDescription,
			extendedHelp: LanguageKeys.Commands.System.SupportExtended,
			guarded: true,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	public async run(message: KlasaMessage) {
		const language = await message.fetchLanguage();
		return message.send(
			new MessageEmbed()
				.setTitle(language.get(LanguageKeys.Commands.System.SupportEmbedTitle, { username: message.author.username }))
				.setDescription(language.get(LanguageKeys.Commands.System.SupportEmbedDescription))
				.setColor(await DbSet.fetchColor(message))
		);
	}
}
