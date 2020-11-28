import { DbSet } from '#lib/database/index';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { Kitsu } from '#lib/types/definitions/Kitsu';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors, Mime } from '#utils/constants';
import { fetch, FetchMethods, FetchResultTypes, pickRandom } from '#utils/util';
import { cutText } from '@sapphire/utilities';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`;

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Anime.AnimeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Anime.AnimeExtended),
	usage: '<animeName:string>'
})
export default class extends RichDisplayCommand {
	private readonly kTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [animeName]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { hits: entries } = await this.fetchAPI(language, animeName);
		if (!entries.length) throw language.get(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(entries, language, message);

		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, animeName: string) {
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
							query: animeName,
							facetFilters: ['kind:anime'],
							hitsPerPage: 10
						})
					})
				},
				FetchResultTypes.JSON
			);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(entries: Kitsu.KitsuHit[], language: Language, message: GuildMessage) {
		const embedData = language.get(LanguageKeys.Commands.Anime.AnimeEmbedData);
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
			const animeURL = `https://kitsu.io/anime/${entry.id}`;
			const type = entry.subtype;
			const title = entry.titles.en || entry.titles.en_jp || entry.canonicalTitle || '--';

			const [englishTitle, japaneseTitle, canonicalTitle] = [
				entry.titles.en || entry.titles.en_us,
				entry.titles.ja_jp,
				entry.canonicalTitle
			].map((title) => title || language.get(LanguageKeys.Globals.None));

			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(title)
					.setURL(animeURL)
					.setDescription(
						language.get(LanguageKeys.Commands.Anime.AnimeOutputDescription, {
							englishTitle,
							japaneseTitle,
							canonicalTitle,
							synopsis: synopsis ?? language.get(LanguageKeys.Commands.Anime.AnimeNoSynopsis)
						})
					)
					.setThumbnail(entry.posterImage?.original ?? '')
					.addField(embedData.type, language.get(LanguageKeys.Commands.Anime.AnimeTypes)[type.toUpperCase()] || type, true)
					.addField(embedData.score, score, true)
					.addField(embedData.episodes, entry.episodeCount ? entry.episodeCount : embedData.stillAiring, true)
					.addField(embedData.episodeLength, language.duration(entry.episodeLength * 60 * 1000), true)
					.addField(embedData.ageRating, entry.ageRating, true)
					.addField(embedData.firstAirDate, this.kTimestamp.display(entry.startDate * 1000), true)
					.addField(embedData.watchIt, `**[${title}](${animeURL})**`)
			);
		}
		return display;
	}
}
