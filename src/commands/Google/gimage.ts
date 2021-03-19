import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CustomSearchType, GoogleCSEImageData, GoogleResponseCodes, handleNotOK, queryGoogleCustomSearchAPI } from '#utils/APIs/Google';
import { BrandingColors } from '#utils/constants';
import { getImageUrl, pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['googleimage', 'img'],
	cooldown: 10,
	nsfw: true, // Google will return explicit results when seaching for explicit terms, even when safe-search is on
	description: LanguageKeys.Commands.Google.GimageDescription,
	extendedHelp: LanguageKeys.Commands.Google.GimageExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const query = (await args.rest('string')).replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+');
		const { t } = args;
		const [response, { items }] = await Promise.all([
			message.send(new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)),
			queryGoogleCustomSearchAPI<CustomSearchType.Image>(message, CustomSearchType.Image, query)
		]);

		if (!items || !items.length) this.error(handleNotOK(GoogleResponseCodes.ZeroResults));

		const display = await this.buildDisplay(message, items);

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, items: GoogleCSEImageData[]) {
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		for (const item of items) {
			display.addPageEmbed((embed) => {
				embed.setTitle(item.title).setURL(item.image.contextLink);

				const imageUrl = getImageUrl(item.link);
				if (imageUrl) {
					embed.setImage(imageUrl);
				}

				return embed;
			});
		}

		return display;
	}
}
