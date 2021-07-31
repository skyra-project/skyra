import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText } from '@sapphire/utilities';
import { send } from '@skyra/editable-commands';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Tools.QuoteDescription,
	extendedHelp: LanguageKeys.Commands.Tools.QuoteExtended,
	requiredClientPermissions: ['EMBED_LINKS'],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel);
		const remoteMessage = await args.pick('message', { channel });

		const embed = new MessageEmbed()
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setColor(await this.container.db.fetchColor(message))
			.setImage(getImage(remoteMessage)!)
			.setTimestamp(remoteMessage.createdAt);

		const content = getContent(remoteMessage);
		if (content) embed.setDescription(`[${args.t(LanguageKeys.Misc.JumpTo)}](${remoteMessage.url})\n${cutText(content, 1800)}`);

		return send(message, { embeds: [embed] });
	}
}
