import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { getColor } from '@utils/util';
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
	description: language => language.tget('COMMAND_WAIFU_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_WAIFU_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS']
})
export default class extends SkyraCommand {

	public run(message: KlasaMessage) {
		const url = `https://thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * kMaximum)}.jpg`;
		return message.sendEmbed(new MessageEmbed()
			.setTitle('→')
			.setURL(url)
			.setColor(getColor(message))
			.setImage(url)
			.setFooter(message.language.tget('COMMAND_WAIFU_FOOTER'))
			.setTimestamp());
	}

}
