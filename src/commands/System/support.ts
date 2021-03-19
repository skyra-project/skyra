import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['support-server', 'server'],
	description: LanguageKeys.Commands.System.SupportDescription,
	extendedHelp: LanguageKeys.Commands.System.SupportExtended,
	guarded: true,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		return message.send(
			new MessageEmbed()
				.setTitle(args.t(LanguageKeys.Commands.System.SupportEmbedTitle, { username: message.author.username }))
				.setDescription(args.t(LanguageKeys.Commands.System.SupportEmbedDescription))
				.setColor(await this.context.db.fetchColor(message))
		);
	}
}
