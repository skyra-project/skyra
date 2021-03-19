import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CustomSearchType, GoogleCSEItem, GoogleResponseCodes, handleNotOK, queryGoogleCustomSearchAPI } from '#utils/APIs/Google';
import { BrandingColors } from '#utils/constants';
import { getImageUrl, pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['google', 'googlesearch', 'g', 'search'],
	cooldown: 10,
	description: LanguageKeys.Commands.Google.GsearchDescription,
	extendedHelp: LanguageKeys.Commands.Google.GsearchExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const query = (await args.rest('string')).replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+');
		const { t } = args;
		const [response, { items }] = await Promise.all([
			message.send(new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)),
			queryGoogleCustomSearchAPI<CustomSearchType.Search>(message, CustomSearchType.Search, query)
		]);

		if (!items || !items.length) this.error(handleNotOK(GoogleResponseCodes.ZeroResults));

		const display = await this.buildDisplay(message, items);

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, items: GoogleCSEItem[]) {
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		for (const item of items) {
			display.addPageEmbed((embed: MessageEmbed) => {
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
