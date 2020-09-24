import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

/**
 * Faces were generated with
 * - 𝜓=0.8 for images #0–50,000 (medium quality/medium diversity).
 * - 𝜓=0.6 for #50,001–75,000 (high quality, low diversity).
 * - 𝜓=1.1 for #75,001–100,000 (low quality, high diversity) for a mix of good & interesting faces.
 */
const kMaximum = 100000;

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Anime.WaifuDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Anime.WaifuExtended),
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const url = `https://thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * kMaximum)}.jpg`;
		return message.sendEmbed(
			new MessageEmbed()
				.setTitle('→')
				.setURL(url)
				.setColor(await DbSet.fetchColor(message))
				.setImage(url)
				.setFooter(message.language.get(LanguageKeys.Commands.Anime.WaifuFooter))
				.setTimestamp()
		);
	}
}
