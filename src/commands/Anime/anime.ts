import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { Kitsu } from '#lib/types/definitions/Kitsu';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors, Mime } from '#utils/constants';
import { fetch, FetchMethods, FetchResultTypes, pickRandom } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`;

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Anime.AnimeDescription,
	extendedHelp: LanguageKeys.Commands.Anime.AnimeExtended,
	usage: '<animeName:string>'
})
export default class extends RichDisplayCommand {
	private readonly kTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [animeName]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { hits: entries } = await this.fetchAPI(t, animeName);
		if (!entries.length) throw t(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(entries, t, message);

		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, animeName: string) {
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
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(entries: Kitsu.KitsuHit[], t: TFunction, message: GuildMessage) {
		const embedData = t(LanguageKeys.Commands.Anime.AnimeEmbedData, { returnObjects: true });
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
			].map((title) => title || t(LanguageKeys.Globals.None));

			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(title)
					.setURL(animeURL)
					.setDescription(
						t(LanguageKeys.Commands.Anime.AnimeOutputDescription, {
							englishTitle,
							japaneseTitle,
							canonicalTitle,
							synopsis: synopsis ?? t(LanguageKeys.Commands.Anime.AnimeNoSynopsis)
						})
					)
					.setThumbnail(entry.posterImage?.original ?? '')
					.addField(embedData.type, t(LanguageKeys.Commands.Anime.AnimeTypes, { returnObjects: true })[type.toUpperCase()] || type, true)
					.addField(embedData.score, score, true)
					.addField(embedData.episodes, entry.episodeCount ? entry.episodeCount : embedData.stillAiring, true)
					.addField(embedData.episodeLength, t(LanguageKeys.Globals.DurationValue, { value: entry.episodeLength * 60 * 1000 }), true)
					.addField(embedData.ageRating, entry.ageRating, true)
					.addField(embedData.firstAirDate, this.kTimestamp.display(entry.startDate * 1000), true)
					.addField(embedData.watchIt, `**[${title}](${animeURL})**`)
			);
		}
		return display;
	}
}
