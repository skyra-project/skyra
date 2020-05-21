import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Language, Timestamp } from 'klasa';

export default class extends SkyraCommand {

	private readonly timestamp = new Timestamp('MMMM, dddd dd YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_XKCD_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_XKCD_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true,
			usage: '[query:string]'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		const query = typeof input === 'undefined'
			? null
			: /^\d+$/.test(input)
				? Number(input)
				: input;

		const comicNumber = await this.getNumber(query, message.language);
		const comic = await fetch<XkcdResultOk>(`https://xkcd.com/${comicNumber}/info.0.json`, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('COMMAND_XKCD_NOTFOUND'); });

		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setImage(comic.img)
			.setTitle(comic.title)
			.setURL(`https://xkcd.com/${comicNumber}/`)
			.setFooter(`XKCD | ${comic.num} | ${this.getTime(comic.year, comic.month, comic.day)}`)
			.setDescription(comic.alt)
			.setTimestamp());
	}

	private getTime(year: string, month: string, day: string) {
		return this.timestamp.display(new Date(Number(year), Number(month) - 1, Number(day)));
	}

	private async getNumber(query: string | number | null, i18n: Language) {
		const xkcdInfo = await fetch('https://xkcd.com/info.0.json', FetchResultTypes.JSON) as XkcdResultOk;

		if (typeof query === 'number') {
			if (query <= xkcdInfo.num) return query;
			throw i18n.tget('COMMAND_XKCD_COMICS', xkcdInfo.num);
		}

		if (query) {
			const text = await fetch(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${encodeURIComponent(query)}`, FetchResultTypes.Text);
			const comics = text.split(' ').slice(2);
			const random = Math.floor(Math.random() * (comics.length / 2));
			return parseInt(comics[random * 2].replace(/\n/g, ''), 10);
		}

		return Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
	}

}

export interface XkcdResultOk {
	month: string;
	num: number;
	link: string;
	year: string;
	news: string;
	safe_title: string;
	transcript: string;
	alt: string;
	img: string;
	title: string;
	day: string;
}
