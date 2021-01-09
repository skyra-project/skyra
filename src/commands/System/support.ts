import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['support-server', 'server'],
	description: LanguageKeys.Commands.System.SupportDescription,
	extendedHelp: LanguageKeys.Commands.System.SupportExtended,
	guarded: true,
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const t = await message.fetchT();
		return message.send(
			new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.System.SupportEmbedTitle, { username: message.author.username }))
				.setDescription(t(LanguageKeys.Commands.System.SupportEmbedDescription))
				.setColor(await DbSet.fetchColor(message))
		);
	}
}
