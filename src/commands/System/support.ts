import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['support-server', 'server'],
	description: LanguageKeys.Commands.System.SupportDescription,
	extendedHelp: LanguageKeys.Commands.System.SupportExtended,
	guarded: true,
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const t = await message.fetchT();
		return message.send(
			new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.System.SupportEmbedTitle, { username: message.author.username }))
				.setDescription(t(LanguageKeys.Commands.System.SupportEmbedDescription))
				.setColor(await DbSet.fetchColor(message))
		);
	}
}
