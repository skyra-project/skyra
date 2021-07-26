import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchAniList, getAnime } from '#utils/APIs/AniList';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/time-utilities';
import { cutText, filterNullish, isNullish } from '@sapphire/utilities';
import { MessageEmbed, TextChannel } from 'discord.js';
import { decode } from 'he';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['anilist'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animation.AniListAnimeDescription,
	extendedHelp: LanguageKeys.Commands.Animation.AniListAnimeExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	private htmlEntityReplacements = {
		i: '_',
		em: '_',
		var: '_',
		b: '**',
		br: '\n',
		code: '```',
		pre: '`',
		mark: '`',
		kbd: '`',
		s: '~~',
		wbr: '',
		u: '__'
	};

	private htmlEntityRegex = /<\/?(i|b|br)>/g;
	private excessiveNewLinesRegex = /\n{3,}/g;

	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [search, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		// Get all results
		const results = await this.fetchAPI(search);

		// Ensure any results were returned
		if (!results.pageInfo?.total || !results.media?.length) {
			this.error(LanguageKeys.Commands.Animation.AniListAnimeQueryFail, { search });
		}

		// Check if the current context allows NSFW
		const nsfwEnabled = message.guild !== null && (message.channel as TextChannel).nsfw;

		// If the current context does not allow NSFW then filter out adult only content
		const adultFilteredResults = nsfwEnabled ? results.media : results.media.filter((media) => !media?.isAdult);

		// If we are left with no results then the there were only NSFW results so return an error

		if (!adultFilteredResults?.length) {
			this.error(LanguageKeys.Commands.Animation.AniListAnimeQueryOnlyNsfw, { search });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail(CdnUrls.AnilistLogo)
		});

		const animeTitles = t(LanguageKeys.Commands.Animation.AniListAnimeEmbedTitles);

		for (const result of adultFilteredResults) {
			if (result) {
				display.addPageEmbed((embed) => {
					const [englishName, nativeName, romajiName] = [
						result.title?.english, //
						result.title?.native,
						result.title?.romaji
					].map((title) => title || t(LanguageKeys.Globals.None));

					const description = [
						`**${animeTitles.romajiName}**: ${romajiName}`,
						`**${animeTitles.englishName}**: ${englishName}`,
						`**${animeTitles.nativeName}**: ${nativeName}`
					];

					if (result.countryOfOrigin) {
						description.push(`**${animeTitles.countryOfOrigin}**: ${result.countryOfOrigin}`);
					}

					if (result.episodes) {
						description.push(`**${animeTitles.episodes}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.episodes })}`);
					}

					if (result.duration) {
						description.push(
							`**${animeTitles.episodeLength}**: ${t(LanguageKeys.Globals.DurationValue, {
								value: result.duration * Time.Minute,
								precision: 1
							})}`
						);
					}

					if (!isNullish(result.isAdult)) {
						description.push(
							`**${animeTitles.adultContent}**: ${result.isAdult ? t(LanguageKeys.Globals.Yes) : t(LanguageKeys.Globals.No)}`
						);
					}

					if (!isNullish(result.externalLinks)) {
						const externalLinks = result.externalLinks
							.map((link) => {
								if (link?.url && link.site) {
									return `[${link.site}](${link.url})`;
								}

								return undefined;
							})
							.filter(filterNullish);

						description.push(`**${animeTitles.externalLinks}**: ${t(LanguageKeys.Globals.AndListValue, { value: externalLinks })}`);
					}

					if (result.description) {
						description.push('', this.parseDescription(result.description));
					}

					if (result.siteUrl) {
						embed.setURL(result.siteUrl);
					}

					return embed
						.setTitle(result.title?.english ?? result.title?.romaji ?? result.title?.native) //
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
			} = await fetchAniList(getAnime, { search });

			return Page;
		} catch (error) {
			this.error(LanguageKeys.Commands.Animation.AniListAnimeQueryFail, { search });
		}
	}

	private parseDescription(description: string) {
		return cutText(
			decode(
				description.replace(
					this.htmlEntityRegex,
					(_, type: keyof UserPaginatedMessageCommand['htmlEntityReplacements']) => this.htmlEntityReplacements[type]
				)
			).replace(this.excessiveNewLinesRegex, '\n\n'),
			750
		);
	}
}
