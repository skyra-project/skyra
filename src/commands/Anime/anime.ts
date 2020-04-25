import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Kitsu } from '@lib/types/definitions/Kitsu';
import { TOKENS } from '@root/config';
import { BrandingColors } from '@utils/constants';
import { cutText, fetch, FetchMethods, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.KITSU_ID}-dsn.algolia.net/1/indexes/production_media/query`;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_ANIME_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ANIME_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<animeName:string>'
		});
	}

	public async run(message: KlasaMessage, [animeName]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { hits: entries } = await this.fetchAPI(message, animeName);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = this.buildDisplay(entries, message);

		await display.start(response, message.author.id);
		return response;
	}

	private fetchAPI(message: KlasaMessage, animeName: string) {
		return fetch(API_URL, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': TOKENS.KITSU_KEY,
				'X-Algolia-Application-Id': TOKENS.KITSU_ID
			},
			body: JSON.stringify(
				{
					params: stringify({
						query: animeName,
						facetFilters: ['kind:anime'],
						hitsPerPage: 10
					})
				}
			)
		}, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<Kitsu.KitsuResult>;
	}

	private buildDisplay(entries: Kitsu.KitsuHit[], message: KlasaMessage) {
		const embedData = message.language.tget('COMMAND_ANIME_EMBED_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)))
			.setFooterSuffix(' - © kitsu.io');

		for (const entry of entries) {
			const synopsis = cutText(entry.synopsis.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0], 750);
			const score = `${entry.averageRating}%`;
			const animeURL = `https://kitsu.io/anime/${entry.id}`;
			const type = entry.subtype;
			const title = entry.titles.en || entry.titles.en_jp || entry.canonicalTitle || '--';

			display.addPage((embed: MessageEmbed) => embed
				.setTitle(title)
				.setURL(animeURL)
				.setDescription(message.language.tget('COMMAND_ANIME_OUTPUT_DESCRIPTION', entry, synopsis))
				.setThumbnail(entry.posterImage?.original || '')
				.addField(embedData.TYPE, message.language.tget('COMMAND_ANIME_TYPES')[type.toUpperCase()] || type, true)
				.addField(embedData.SCORE, score, true)
				.addField(embedData.EPISODES, entry.episodeCount ? entry.episodeCount : embedData.STILL_AIRING, true)
				.addField(embedData.EPISODE_LENGTH, message.language.duration(entry.episodeLength * 60 * 1000), true)
				.addField(embedData.AGE_RATING, entry.ageRating, true)
				.addField(embedData.FIRST_AIR_DATE, new Timestamp('MMMM d YYYY').display(entry.startDate * 1000), true)
				.addField(embedData.WATCH_IT, `**[${title}](${animeURL})**`));
		}
		return display;
	}

}
