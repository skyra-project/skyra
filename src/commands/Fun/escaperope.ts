import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#utils/constants';
import { deleteMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['escape'],
	description: LanguageKeys.Commands.Fun.EscapeRopeDescription,
	extendedHelp: LanguageKeys.Commands.Fun.EscapeRopeExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		if (message.deletable) await deleteMessage(message).catch(() => null);

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setImage(CdnUrls.EscapeRopeGif)
			.setDescription(args.t(LanguageKeys.Commands.Fun.EscapeRopeOutput, { user: message.author.toString() }))
			.setAuthor(
				message.member?.displayName ?? message.author.username,
				message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			);
		return send(message, { embeds: [embed] });
	}
}
