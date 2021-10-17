import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { fetchAniList, getManga, parseDescription } from '#utils/APIs/AniList';
import { minutes } from '#utils/common';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { filterNullish, isNullish } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['manga-list'],
	description: LanguageKeys.Commands.Animation.AniListMangaDescription,
	detailedDescription: LanguageKeys.Commands.Animation.AniListMangaExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const search = await args.rest('string');

		// Get all results
		const results = await this.fetchAPI(search);

		// Ensure any results were returned
		if (!results.pageInfo?.total || !results.media?.length) {
			this.error(LanguageKeys.Commands.Animation.AniListMangaQueryFail, { search });
		}

		// Check if the current context allows NSFW
		const nsfwEnabled = isNsfwChannel(message.channel);

		// If the current context does not allow NSFW then filter out adult only content
		const adultFilteredResults = nsfwEnabled ? results.media : results.media.filter((media) => !media?.isAdult);

		// If we are left with no results then the there were only NSFW results so return an error

		if (!adultFilteredResults?.length) {
			this.error(LanguageKeys.Commands.Animation.AniListQueryOnlyNsfw, { search });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.AnilistLogo)
		});

		const anilistTitles = t(LanguageKeys.Commands.Animation.AniListEmbedTitles);

		for (const result of adultFilteredResults) {
			if (result) {
				display.addPageEmbed((embed) => {
					const [englishName, nativeName, romajiName] = [
						result.title?.english, //
						result.title?.native,
						result.title?.romaji
					].map((title) => title || t(LanguageKeys.Globals.None));

					const description = [
						`**${anilistTitles.romajiName}**: ${romajiName}`,
						`**${anilistTitles.englishName}**: ${englishName}`,
						`**${anilistTitles.nativeName}**: ${nativeName}`
					];

					if (result.countryOfOrigin) {
						description.push(`**${anilistTitles.countryOfOrigin}**: ${result.countryOfOrigin}`);
					}

					if (result.chapters) {
						description.push(`**${anilistTitles.chapters}**: ${formatNumber(t, result.chapters)}`);
					}

					if (result.volumes) {
						description.push(`**${anilistTitles.volumes}**: ${formatNumber(t, result.volumes)}`);
					}

					if (result.duration) {
						description.push(
							`**${anilistTitles.episodeLength}**: ${t(LanguageKeys.Globals.DurationValue, {
								value: minutes(result.duration),
								precision: 1
							})}`
						);
					}

					if (!isNullish(result.isAdult)) {
						description.push(
							`**${anilistTitles.adultContent}**: ${result.isAdult ? t(LanguageKeys.Globals.Yes) : t(LanguageKeys.Globals.No)}`
						);
					}

					if (result.externalLinks?.length) {
						const externalLinks = result.externalLinks
							.map((link) => {
								if (link?.url && link.site) {
									return `[${link.site}](${link.url})`;
								}

								return undefined;
							})
							.filter(filterNullish);

						description.push(`**${anilistTitles.externalLinks}**: ${t(LanguageKeys.Globals.AndListValue, { value: externalLinks })}`);
					}

					if (result.description) {
						description.push('', parseDescription(result.description));
					}

					if (result.siteUrl) {
						embed.setURL(result.siteUrl);
					}

					return embed
						.setTitle(result.title?.english ?? result.title?.romaji ?? result.title?.native ?? '') //
						.setDescription(description.join('\n'))
						.setImage(`https://img.anili.st/media/${result.id}`);
				});
			}
		}

		await display.run(loadingMessage, message.author);
		return loadingMessage;
	}

	private async fetchAPI(search: string) {
		try {
			const {
				data: { Page }
			} = await fetchAniList(getManga, { search });

			return Page;
		} catch (error) {
			this.error(LanguageKeys.Commands.Animation.AniListMangaQueryFail, { search });
		}
	}
}
