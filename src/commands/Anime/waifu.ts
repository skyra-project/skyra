import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';

/**
 * Faces were generated with
 * - 𝜓=0.7 for images #0–60,000 (high quality but low diversity).
 * - 𝜓=1.0 for #60,001–70,000 (low quality, high diversity).
 * - 𝜓=0.6 for #70,001–100,000 for a mix of good & interesting faces.
 * Images #100,000–#199,999 were generated using a dataset of more loosely cropped faces for a more 'portrait' look, and 𝜓=0.5.
 */
const kMaximum = 199999;


export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WAIFU_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WAIFU_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS']
		});
	}

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
