import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['escape'],
	bucket: 2,
	cooldown: 60,
	description: LanguageKeys.Commands.Fun.EscapeRopeDescription,
	extendedHelp: LanguageKeys.Commands.Fun.EscapeRopeExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		if (message.deletable) await message.nuke().catch(() => null);

		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setImage(CdnUrls.EscapeRopeGif)
				.setDescription(args.t(LanguageKeys.Commands.Fun.EscapeRopeOutput, { user: message.author.toString() }))
				.setAuthor(
					message.member?.displayName ?? message.author.username,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
		);
	}
}
