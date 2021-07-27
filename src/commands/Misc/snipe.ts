import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { getSnipedMessage } from '#utils/functions';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sniped'],
	description: LanguageKeys.Commands.Misc.SnipeDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SnipeExtended,
	permissions: ['EMBED_LINKS'],
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text', 'news']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const sniped = getSnipedMessage(message.channel);
		if (sniped === null) this.error(LanguageKeys.Commands.Misc.SnipeEmpty);

		const embed = new MessageEmbed()
			.setTitle(args.t(LanguageKeys.Commands.Misc.SnipeTitle))
			.setColor(await this.context.db.fetchColor(sniped))
			.setAuthor(sniped.author.username, sniped.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return message.send(embed);
	}
}
