import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CustomSearchType, GoogleCSEItem, GoogleResponseCodes, handleNotOK, queryGoogleCustomSearchAPI } from '#utils/APIs/Google';
import { getImageUrl, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('GOOGLE_CUSTOM_SEARCH_WEB_TOKEN', 'GOOGLE_CUSTOM_SEARCH_IMAGE_TOKEN', 'GOOGLE_API_TOKEN'),
	aliases: ['google', 'googlesearch', 'g', 'search'],
	description: LanguageKeys.Commands.Google.GsearchDescription,
	detailedDescription: LanguageKeys.Commands.Google.GsearchExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const query = (await args.rest('string')).replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+');
		const [response, { items }] = await Promise.all([
			sendLoadingMessage(message, args.t),
			queryGoogleCustomSearchAPI<CustomSearchType.Search>(message, CustomSearchType.Search, query)
		]);

		if (!items || !items.length) this.error(handleNotOK(GoogleResponseCodes.ZeroResults));

		const display = await this.buildDisplay(message, items);

		await display.run(response, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, items: GoogleCSEItem[]) {
		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(await this.container.db.fetchColor(message)) });

		for (const item of items) {
			display.addPageEmbed((embed) => {
				embed //
					.setTitle(item.title)
					.setURL(item.link);

				if (item.snippet) {
					embed.setDescription(item.snippet);
				}

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
