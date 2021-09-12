import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';
import { URL } from 'url';

const url = new URL('https://api.bunnies.io/v2/loop/random/?media=gif,png');

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bunbun', 'rabbit'],
	description: LanguageKeys.Commands.Animal.BunnyDescription,
	detailedDescription: LanguageKeys.Commands.Animal.BunnyExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const {
			media: { gif },
			source: bunnySource
		} = await fetch<BunnyResultOk>(url, FetchResultTypes.JSON);

		const imageUrl = getImageUrl(gif) ?? 'https://i.imgur.com/FnAPcxj.jpg';
		const translations = args.t(LanguageKeys.Commands.Animal.BunnyEmbedData);
		const source = this.getSource(bunnySource);

		const embed = new MessageEmbed()
			.setURL(imageUrl)
			.setTitle(translations.title)
			.setColor(await this.container.db.fetchColor(message))
			.setImage(imageUrl)
			.setTimestamp();

		if (source) {
			embed.setDescription(`[${translations.source}](${source})`);
		}

		return send(message, { embeds: [embed] });
	}

	private getSource(bunnySource: string): string | null {
		if (isNullishOrEmpty(bunnySource) || bunnySource.toLowerCase() === 'unknown') return null;
		return bunnySource;
	}
}

interface BunnyResultOk {
	id: string;
	media: {
		gif: string;
		poster: string;
	};
	source: string;
	thisServed: number;
	totalServed: number;
}
