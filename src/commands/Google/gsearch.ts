import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/commands/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { CustomSearchType, GoogleCSEItem, GoogleResponseCodes, handleNotOK, queryGoogleCustomSearchAPI } from '#utils/APIs/Google';
import { BrandingColors } from '#utils/constants';
import { getImageUrl, pickRandom } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['google', 'googlesearch', 'g', 'search'],
	cooldown: 10,
	description: LanguageKeys.Commands.Google.GsearchDescription,
	extendedHelp: LanguageKeys.Commands.Google.GsearchExtended,
	usage: '<query:query>'
})
@CreateResolvers([
	[
		'query',
		(arg, possible, message) =>
			message.client.arguments
				.get('string')!
				.run(arg.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+'), possible, message)
	]
])
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [query]: [string]) {
		const t = await message.fetchT();
		const [response, { items }] = await Promise.all([
			message.send(new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)),
			queryGoogleCustomSearchAPI<CustomSearchType.Search>(message, CustomSearchType.Search, query)
		]);

		if (!items || !items.length) throw t(handleNotOK(GoogleResponseCodes.ZeroResults, message.client));

		const display = await this.buildDisplay(message, items);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: GuildMessage, items: GoogleCSEItem[]) {
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const item of items) {
			display.addPage((embed: MessageEmbed) => {
				embed.setTitle(item.title).setURL(item.link).setDescription(item.snippet);

				const imageUrl = this.getImageUrl(item);
				if (imageUrl) embed.setImage(imageUrl);

				return embed;
			});
		}

		return display;
	}

	private getImageUrl(item: GoogleCSEItem): string | undefined {
		for (const image of item.pagemap?.cse_image ?? []) {
			const imageUrl = getImageUrl(image.src);
			if (imageUrl) return imageUrl;
		}

		return undefined;
	}
}
