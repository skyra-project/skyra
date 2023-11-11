import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { getSnipedMessage } from '#utils/functions';
import { getColor, getContent, getFullEmbedAuthor, getImage } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sniped'],
	description: LanguageKeys.Commands.Misc.SnipeDescription,
	detailedDescription: LanguageKeys.Commands.Misc.SnipeExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	permissionLevel: PermissionLevels.Moderator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const sniped = getSnipedMessage(message.channel);
		if (sniped === null) this.error(LanguageKeys.Commands.Misc.SnipeEmpty);

		const embed = new EmbedBuilder()
			.setTitle(args.t(LanguageKeys.Commands.Misc.SnipeTitle))
			.setColor(getColor(sniped))
			.setAuthor(getFullEmbedAuthor(sniped.author))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return send(message, { embeds: [embed] });
	}
}
