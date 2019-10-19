import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { stringify } from 'querystring';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { Kitsu } from '../../lib/types/definitions/Kitsu';
import { cutText, fetch, getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_MANGA_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MANGA_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<mangaName:string>'
		});
	}

	public async run(message: KlasaMessage, [mangaName]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(getColor(message) || 0xFFAB2D));

		const { hits: entries } = await fetch(`https://${TOKENS.KITSU.ID}-dsn.algolia.net/1/indexes/production_media/query`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': TOKENS.KITSU.KEY,
				'X-Algolia-Application-Id': TOKENS.KITSU.ID
			},
			body: JSON.stringify(
				{
					params: stringify({
						query: mangaName,
						facetFilters: ['kind:manga'],
						hitsPerPage: 10
					})
				}
			)
		}, 'json')
			.catch(() => { throw message.language.tget('COMMAND_ANIME_QUERY_FAIL'); }) as Kitsu.KitsuResult;

		const display = this.buildDisplay(entries, message);

		await display.run(response, message.author.id);
		return response;
	}

	private buildDisplay(entries: Kitsu.KitsuHit[], message: KlasaMessage) {
		const display = new UserRichDisplay();

		for (const entry of entries) {
			const synopsis = cutText(entry.synopsis.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0], 750);
			const score = `${entry.averageRating}%`;
			const mangaURL = `https://kitsu.io/manga/${entry.id}`;
			const titles = message.language.language.COMMAND_ANIME_TITLES as unknown as MangaLanguage;
			const type = entry.subtype;
			const title = entry.titles.en || entry.titles.en_jp || entry.canonicalTitle || '--';

			display.addPage(
				new MessageEmbed()
					.setColor(getColor(message) || 0xFFAB2D)
					.setTitle(title)
					.setURL(mangaURL)
					.setDescription(message.language.tget('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
					.setThumbnail(entry.posterImage.original)
					.addField(titles.TYPE, message.language.tget('COMMAND_MANGA_TITLES')[type.toUpperCase()] || type, true)
					.addField(titles.SCORE, score, true)
					.addField(titles.AGE_RATING, entry.ageRating ? entry.ageRating : 'None', true)
					.addField(titles.FIRST_PUBLISH_DATE, new Timestamp('MMMM d YYYY').display(entry.startDate), true)
					.addField(titles.READ_IT, `**[${title}](${mangaURL})**`)
					.setFooter('© kitsu.io')
			);
		}
		return display;
	}

}

interface MangaLanguage {
	TYPE: string;
	SCORE: string;
	EPISODES: string;
	EPISODE_LENGTH: string;
	AGE_RATING: string;
	FIRST_AIR_DATE: string;
	FIRST_PUBLISH_DATE: string;
	WATCH_IT: string;
	READ_IT: string;
}
