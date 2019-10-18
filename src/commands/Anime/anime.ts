import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { Kitsu } from '../../lib/types/definitions/Kitsu';
import { cutText, fetch, getColor, oneToTen } from '../../lib/util/util';

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
			.setColor(getColor(message) || 0xFFAB2D));

		const url = new URL('https://kitsu.io/api/edge/anime');
		url.searchParams.append('filter[text]', animeName);

		const { data: entries } = await fetch(url, 'json')
			.catch(() => { throw message.language.tget('COMMAND_ANIME_QUERY_FAIL'); }) as Kitsu.Result<Kitsu.MangaAttributes>;

		const list = entries.map(entry => {
			if (entry.attributes.averageRating === null) entry.attributes.averageRating = this.extractAverage(entry);
			return entry;
		});

		const display = this.buildDisplay(list, message);

		await display.run(response, message.author.id);
		return response;
	}

	private extractAverage(entry: Kitsu.Datum) {
		let total = 0;
		let max = 0;
		for (const array of Object.entries(entry.attributes.ratingFrequencies)) {
			const [key, value] = array.map(Number);
			total += key * value;
			max += value;
		}

		return total ? ((total / (max * 20)) * 100).toFixed(2) : '--.--';
	}

	private buildDisplay(entries: (Kitsu.Datum<Kitsu.MangaAttributes>)[], message: KlasaMessage) {
		const display = new UserRichDisplay();

		for (const entry of entries) {
			const synopsis = cutText(entry.attributes.synopsis, 750);
			const score = oneToTen(Math.ceil(Number(entry.attributes.averageRating) / 10))!;
			const animeURL = `https://kitsu.io/anime/${entry.attributes.slug}`;
			const titles = message.language.language.COMMAND_ANIME_TITLES as unknown as AnimeLanguage;
			const type = entry.attributes.subtype;
			const title = entry.attributes.titles.en || entry.attributes.titles.en_jp || Object.values(entry.attributes.titles)[0] || '--';

			display.addPage(
				new MessageEmbed()
					.setColor(score.color)
					.setAuthor(title, entry.attributes.posterImage.tiny, animeURL)
					.setDescription(message.language.tget('COMMAND_ANIME_OUTPUT_DESCRIPTION', entry, synopsis))
					.addField(titles.TYPE, message.language.tget('COMMAND_ANIME_TYPES')[type.toUpperCase()] || type, true)
					.addField(titles.SCORE, `**${entry.attributes.averageRating}** / 100 ${score.emoji}`, true)
					.addField(titles.STATUS, message.language.tget('COMMAND_ANIME_OUTPUT_STATUS', entry))
					.addField(titles.WATCH_IT, `**[${title}](${animeURL})**`)
					.setFooter('© kitsu.io')
			);
		}
		return display;
	}


}

interface AnimeLanguage {
	TYPE: string;
	SCORE: string;
	STATUS: string;
	WATCH_IT: string;
	READ_IT: string;
}
