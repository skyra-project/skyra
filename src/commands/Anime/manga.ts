import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Kitsu } from '../../lib/types/definitions/Kitsu';
import { prompt } from '../../lib/util/PromptList';
import { cutText, fetch, oneToTen } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.get('COMMAND_MANGA_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_MANGA_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<mangaName:string>'
		});
	}

	public async run(message: KlasaMessage, [mangaName]: [string]) {
		const url = new URL('https://kitsu.io/api/edge/manga');
		url.searchParams.append('filter[text]', mangaName);

		const body = await fetch(url, 'json')
			.catch(() => { throw message.language.get('COMMAND_ANIME_QUERY_FAIL'); }) as Kitsu.Result<Kitsu.MangaAttributes>;

		const entry = await this.getIndex(message, body.data)
			.catch(error => { throw error || message.language.get('COMMAND_ANIME_NO_CHOICE'); });

		const synopsis = cutText(entry.attributes.synopsis, 750);
		const score = oneToTen(Math.ceil(Number(entry.attributes.averageRating) / 10))!;
		const mangaURL = `https://kitsu.io/manga/${entry.attributes.slug}`;
		const titles = message.language.language.COMMAND_ANIME_TITLES as unknown as MangaLanguage;
		const type = entry.attributes.subtype;
		const title = entry.attributes.titles.en || entry.attributes.titles.en_jp || Object.values(entry.attributes.titles)[0] || '--';

		return message.sendEmbed(new MessageEmbed()
			.setColor(score.color)
			.setAuthor(title, entry.attributes.posterImage.tiny, mangaURL)
			.setDescription(message.language.get('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
			.addField(titles.TYPE, message.language.get('COMMAND_MANGA_TITLES')[type.toUpperCase()] || type, true)
			.addField(titles.SCORE, `**${entry.attributes.averageRating}** / 100 ${score.emoji}`, true)
			.addField(titles.STATUS, message.language.get('COMMAND_MANGA_OUTPUT_STATUS', entry))
			.addField(titles.READ_IT, `**[${title}](${mangaURL})**`)
			.setFooter('© kitsu.io'));
	}

	private async getIndex(message: KlasaMessage, entries: Kitsu.Datum[]) {
		if (entries.length === 1) return entries[0];
		const _choice = await prompt(message, entries.slice(0, 10).map(entry => {
			if (entry.attributes.averageRating === null) entry.attributes.averageRating = this.extractAverage(entry);
			return `(${entry.attributes.averageRating}) ${this.extractTitle(entry.attributes.titles)}`;
		}));
		const chosen = entries[_choice];
		if (!chosen) throw message.language.get('COMMAND_ANIME_INVALID_CHOICE');
		return chosen;
	}

	private extractTitle(titles: Kitsu.Titles) {
		return Object.values(titles).find(Boolean);
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

}

interface MangaLanguage {
	TYPE: string;
	SCORE: string;
	STATUS: string;
	WATCH_IT: string;
	READ_IT: string;
}
