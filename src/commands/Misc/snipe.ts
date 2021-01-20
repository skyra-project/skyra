import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sniped'],
	description: LanguageKeys.Commands.Misc.SnipeDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SnipeExtended,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		const { sniped } = message.channel as TextChannel;
		if (sniped === null) throw await message.resolveKey(LanguageKeys.Commands.Misc.SnipeEmpty);

		const embed = new MessageEmbed()
			.setTitle(await message.resolveKey(LanguageKeys.Commands.Misc.SnipeTitle))
			.setColor(await DbSet.fetchColor(sniped))
			.setAuthor(sniped.author.username, sniped.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return message.send(embed);
	}
}
