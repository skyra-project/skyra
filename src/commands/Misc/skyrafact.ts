import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['aifact', 'botfact'],
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.SkyraFactDescription,
	extendedHelp: LanguageKeys.Commands.Misc.SkyraFactExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(args.t(LanguageKeys.Commands.Misc.SkyraFactTitle))
				.setDescription(this.getLine(args))
		);
	}

	private getLine(args: SkyraCommand.Args) {
		const lines = args.t(LanguageKeys.Commands.Misc.SkyraFactMessages);
		const index = Math.floor(Math.random() * lines.length);
		return lines[index] || args.t(LanguageKeys.Commands.Misc.SkyraFactMessages, { lng: 'en-US' })[index];
	}
}
