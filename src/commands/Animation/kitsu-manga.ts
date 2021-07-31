import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Kitsu } from '#lib/types/definitions/Kitsu';
import { sendLoadingMessage } from '#utils/util';
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
	description: LanguageKeys.Commands.Animation.KitsuMangaDescription,
	extendedHelp: LanguageKeys.Commands.Animation.KitsuMangaExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const mangaName = await args.rest('string');
		const response = await sendLoadingMessage(message, args.t);

		const { hits: entries } = await this.fetchAPI(mangaName);
		if (!entries.length) this.error(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(entries, args.t, message);

		await display.run(response, message.author);
		return response;
	}

	private async fetchAPI(mangaName: string) {
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
							query: mangaName,
							facetFilters: ['kind:manga'],
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
		const embedData = t(LanguageKeys.Commands.Animation.KitsuMangaEmbedData);
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed().setColor(await this.container.db.fetchColor(message)).setFooter(' - © kitsu.io')
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
			const mangaURL = `https://kitsu.io/manga/${entry.id}`;
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
					.setURL(mangaURL)
					.setDescription(
						t(LanguageKeys.Commands.Animation.KitsuMangaOutputDescription, {
							englishTitle,
							japaneseTitle,
							canonicalTitle,
							synopsis: synopsis ?? t(LanguageKeys.Commands.Animation.KitsuAnimeNoSynopsis)
						})
					)
					.setThumbnail(entry.posterImage?.original || '')
					.addField(embedData.type, t(LanguageKeys.Commands.Animation.KitsuMangaTypes)[type.toUpperCase()] || type, true)
					.addField(embedData.score, score, true)
					.addField(embedData.ageRating, entry.ageRating ? entry.ageRating : embedData.none, true)
					.addField(embedData.firstPublishDate, t(LanguageKeys.Globals.DateValue, { value: entry.startDate * 1000 }), true)
					.addField(embedData.readIt, `**[${title}](${mangaURL})**`)
			);
		}

		return display;
	}
}
