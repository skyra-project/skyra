import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { PermissionFlagsBits, type Message } from 'discord.js';

const url = new URL('https://api.bunnies.io/v2/loop/random/?media=gif,png');

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bunbun', 'rabbit'],
	description: LanguageKeys.Commands.Animal.BunnyDescription,
	detailedDescription: LanguageKeys.Commands.Animal.BunnyExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const {
			media: { gif },
			source: bunnySource
		} = await fetch<BunnyResultOk>(url, FetchResultTypes.JSON);

		const imageUrl = getImageUrl(gif) ?? 'https://i.imgur.com/FnAPcxj.jpg';
		const translations = args.t(LanguageKeys.Commands.Animal.BunnyEmbedData);
		const source = this.getSource(bunnySource);

		const embed = new EmbedBuilder().setURL(imageUrl).setTitle(translations.title).setColor(getColor(message)).setImage(imageUrl).setTimestamp();

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
