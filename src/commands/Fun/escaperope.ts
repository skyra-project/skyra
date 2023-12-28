import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#utils/constants';
import { deleteMessage } from '#utils/functions';
import { getColor, getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['escape'],
	description: LanguageKeys.Commands.Fun.EscapeRopeDescription,
	detailedDescription: LanguageKeys.Commands.Fun.EscapeRopeExtended
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		if (message.deletable) await deleteMessage(message).catch(() => null);

		const embed = new EmbedBuilder()
			.setColor(getColor(message))
			.setImage(CdnUrls.EscapeRopeGif)
			.setDescription(args.t(LanguageKeys.Commands.Fun.EscapeRopeOutput, { user: message.author.toString() }))
			.setAuthor(getFullEmbedAuthor(message.author));
		return send(message, { embeds: [embed] });
	}
}
