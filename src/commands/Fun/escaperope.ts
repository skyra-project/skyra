import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['escape'],
	bucket: 2,
	cooldown: 60,
	description: (language) => language.get('commandEscaperopeDescription'),
	extendedHelp: (language) => language.get('commandEscaperopeExtended')
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		if (message.deletable) await message.nuke().catch(() => null);

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(CdnUrls.EscapeRopeGif)
				.setDescription(message.language.get('commandEscaperopeOutput', { user: message.author }))
				.setAuthor(
					message.member?.displayName ?? message.author.username,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
		);
	}
}
