import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

/**
 * Faces were generated with
 * - 𝜓=0.8 for images #0–50,000 (medium quality/medium diversity).
 * - 𝜓=0.6 for #50,001–75,000 (high quality, low diversity).
 * - 𝜓=1.1 for #75,001–100,000 (low quality, high diversity) for a mix of good & interesting faces.
 */
const kMaximum = 100000;

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Animation.WaifuDescription,
	extendedHelp: LanguageKeys.Commands.Animation.WaifuExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const url = `https://thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * kMaximum)}.jpg`;
		return message.send(
			new MessageEmbed()
				.setTitle('→')
				.setURL(url)
				.setColor(await this.context.db.fetchColor(message))
				.setImage(getImageUrl(url) ?? 'https://i.imgur.com/vKUeMoH.png')
				.setFooter(args.t(LanguageKeys.Commands.Animation.WaifuFooter))
				.setTimestamp()
		);
	}
}
