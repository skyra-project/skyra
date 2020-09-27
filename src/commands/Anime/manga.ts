import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Kitsu } from '@lib/types/definitions/Kitsu';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TOKENS } from '@root/config';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Mime } from '@utils/constants';
import { fetch, FetchMethods, FetchResultTypes, pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Timestamp } from 'klasa';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`;

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Anime.MangaDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Anime.MangaExtended),
	usage: '<mangaName:string>'
})
export default class extends RichDisplayCommand {
	private readonly kTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: KlasaMessage, [mangaName]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { hits: entries } = await this.fetchAPI(message, mangaName);
		if (!entries.length) throw message.language.get(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(entries, message);

		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, mangaName: string) {
		try {
			return fetch<Kitsu.KitsuResult>(
				API_URL,
				{
					method: FetchMethods.Post,
					headers: {
						'Content-Type': Mime.Types.ApplicationJson,
						'X-Algolia-API-Key': TOKENS.KITSU_KEY,
						'X-Algolia-Application-Id': TOKENS.KITSU_ID
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
			throw message.language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(entries: Kitsu.KitsuHit[], message: KlasaMessage) {
		const embedData = message.language.get(LanguageKeys.Commands.Anime.MangaEmbedData);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message))).setFooterSuffix(' - © kitsu.io');

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
			].map((title) => title || message.language.get(LanguageKeys.Globals.None));

			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(title)
					.setURL(mangaURL)
					.setDescription(
						message.language.get(LanguageKeys.Commands.Anime.MangaOutputDescription, {
							englishTitle,
							japaneseTitle,
							canonicalTitle,
							synopsis: synopsis ?? message.language.get(LanguageKeys.Commands.Anime.AnimeNoSynopsis)
						})
					)
					.setThumbnail(entry.posterImage?.original || '')
					.addField(embedData.type, message.language.get(LanguageKeys.Commands.Anime.MangaTypes)[type.toUpperCase()] || type, true)
					.addField(embedData.score, score, true)
					.addField(embedData.ageRating, entry.ageRating ? entry.ageRating : embedData.none, true)
					.addField(embedData.firstPublishDate, this.kTimestamp.display(entry.startDate * 1000), true)
					.addField(embedData.readIt, `**[${title}](${mangaURL})**`)
			);
		}
		return display;
	}
}
