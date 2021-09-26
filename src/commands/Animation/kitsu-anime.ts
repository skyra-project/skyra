import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Kitsu } from '#lib/types/definitions/Kitsu';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { stringify } from 'querystring';

const API_URL = `https://${process.env.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`;

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('KITSU_ID', 'KITSU_TOKEN'),
	description: LanguageKeys.Commands.Animation.KitsuAnimeDescription,
	detailedDescription: LanguageKeys.Commands.Animation.KitsuAnimeExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const animeName = await args.rest('string');
		const response = await sendLoadingMessage(message, args.t);

		const { hits: entries } = await this.fetchAPI(animeName);
		if (!entries.length) this.error(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(entries, args.t, message);

		await display.run(response, message.author);
		return response;
	}

	private async fetchAPI(animeName: string) {
		try {
			return fetch<Kitsu.KitsuResult>(
				API_URL,
				{
					method: FetchMethods.Post,
					headers: {
						'Content-Type': MimeTypes.ApplicationJson,
						'X-Algolia-API-Key': process.env.KITSU_TOKEN,
						'X-Algolia-Application-Id': process.env.KITSU_ID
					},
					body: JSON.stringify({
						params: stringify({
							query: animeName,
							facetFilters: ['kind:anime'],
							hitsPerPage: 10
						})
					})
				},
				FetchResultTypes.JSON
			);
		} catch {
			this.error(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(entries: Kitsu.KitsuHit[], t: TFunction, message: GuildMessage) {
		const embedData = t(LanguageKeys.Commands.Animation.KitsuAnimeEmbedData);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setFooter('© kitsu.io')
		});

		for (const entry of entries) {
			const description =
				// Prefer the synopsis
				entry.synopsis ||
				// Then prefer the English description
				entry.description?.en ||
				// Then prefer the English-us description
				entry.description?.en_us ||
				// Then prefer the latinized Japanese description
				entry.description?.en_jp ||
				// Then the description in kanji / hiragana / katakana
				entry.description?.ja_jp ||
				// If all fails just get the first key of the description
				entry.description?.[Object.keys(entry.description!)[0]];
			const synopsis = description ? cutText(description.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0], 750) : null;
			const score = `${entry.averageRating}%`;
			const animeURL = `https://kitsu.io/anime/${entry.id}`;
			const type = entry.subtype;
			const title = entry.titles.en || entry.titles.en_jp || entry.canonicalTitle || '--';

			const [englishTitle, japaneseTitle, canonicalTitle] = [
				entry.titles.en || entry.titles.en_us,
				entry.titles.ja_jp,
				entry.canonicalTitle
			].map((title) => title || t(LanguageKeys.Globals.None));

			display.addPageEmbed((embed) =>
				embed
					.setTitle(title)
					.setURL(animeURL)
					.setDescription(
						t(LanguageKeys.Commands.Animation.KitsuAnimeOutputDescription, {
							englishTitle,
							japaneseTitle,
							canonicalTitle,
							synopsis: synopsis ?? t(LanguageKeys.Commands.Animation.KitsuAnimeNoSynopsis)
						})
					)
					.setThumbnail(entry.posterImage?.original ?? '')
					.addField(embedData.type, t(LanguageKeys.Commands.Animation.KitsuAnimeTypes)[type.toUpperCase()] || type, true)
					.addField(embedData.score, score, true)
					.addField(embedData.episodes, entry.episodeCount ? formatNumber(t, entry.episodeCount) : embedData.stillAiring, true)
					.addField(embedData.episodeLength, t(LanguageKeys.Globals.DurationValue, { value: entry.episodeLength * 60 * 1000 }), true)
					.addField(embedData.ageRating, entry.ageRating, true)
					.addField(embedData.firstAirDate, time(entry.startDate, TimestampStyles.ShortDate), true)
					.addField(embedData.watchIt, `**[${title}](${animeURL})**`)
			);
		}

		return display;
	}
}
