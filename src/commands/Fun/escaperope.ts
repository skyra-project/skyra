import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['escape'],
	bucket: 2,
	cooldown: 60,
	description: LanguageKeys.Commands.Fun.EscapeRopeDescription,
	extendedHelp: LanguageKeys.Commands.Fun.EscapeRopeExtended
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		if (message.deletable) await message.nuke().catch(() => null);

		const t = await message.fetchT();
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(CdnUrls.EscapeRopeGif)
				.setDescription(t(LanguageKeys.Commands.Fun.EscapeRopeOutput, { user: message.author.toString() }))
				.setAuthor(
					message.member?.displayName ?? message.author.username,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
		);
	}
}
