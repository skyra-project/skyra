import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['letmegooglethatforyou', 'letmegooglethat'],
	cooldown: 10,
	description: LanguageKeys.Commands.Google.LmgtfyDescription,
	extendedHelp: LanguageKeys.Commands.Google.LmgtfyExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const [query, color] = await Promise.all([args.rest('string'), this.context.db.fetchColor(message)]);

		const url = new URL('https://letmegooglethat.com/');
		url.searchParams.append('q', query);

		return message.send(
			new MessageEmbed() //
				.setColor(color) //
				.setDescription(
					args.t(
						LanguageKeys.Commands.Google.LmgtfyClick,
						{ link: url } //
					)
				)
		);
	}
}
