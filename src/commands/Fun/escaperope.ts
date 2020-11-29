import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['escape'],
	bucket: 2,
	cooldown: 60,
	description: (language) => language.get(LanguageKeys.Commands.Fun.EscaperopeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.EscaperopeExtended)
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		if (message.deletable) await message.nuke().catch(() => null);
		const language = await message.fetchLanguage();

		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(CdnUrls.EscapeRopeGif)
				.setDescription(language.get(LanguageKeys.Commands.Fun.EscaperopeOutput, { user: message.author.toString() }))
				.setAuthor(
					message.member?.displayName ?? message.author.username,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
		);
	}
}
