import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { TOKENS } from '../../../../config';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { BrandingColors } from '../../../lib/util/constants';
import { cutText, fetch, getColor } from '../../../lib/util/util';

const API_URL = 'https://api-v3.igdb.com/games';
enum IgdbAgeRating {
	Three = 1,
	Seven = 2,
	Twelve = 3,
	Sixteen = 4,
	Eighteen = 5,
	RP = 6,
	EC = 7,
	E = 8,
	E10 = 9,
	T = 10,
	M = 11,
	AO = 12
}

export default class extends SkyraCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_IGDB_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_IGDB_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<game:str>'
		});
	}

	public async run(message: KlasaMessage, [game]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const entries = await this.fetchAPI(message, game);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = this.buildDisplay(entries, message);
		await display.start(response, message.author.id);
		return response;
	}

	private fetchAPI(message: KlasaMessage, game: string) {
		return fetch(API_URL, {
			method: 'POST',
			headers: {
				'user-key': TOKENS.INTERNETGAMEDATABASE
			},
			body: [
				`search: "${game}";`,
				'fields name, url, summary, rating, involved_companies.developer,',
				'involved_companies.company.name, genres.name, release_dates.date,',
				'platforms.name, cover.url, age_ratings.rating, age_ratings.category;',
				'where age_ratings != n;',
				'limit 10;',
				'offset 0;'
			].join('')
		}, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<IgdbGame[]>;
	}

	private buildDisplay(entries: IgdbGame[], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_IGDB_TITLES');
		const fieldsData = message.language.tget('COMMAND_IGDB_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const game of entries) {
			console.log(game);
			const coverImg = /https?:/i.test(game.cover.url) ? game.cover.url : `https:${game.cover.url}`;
			const userRating = game.rating ? `${this.roundNumber(game.rating, 2)}%` : fieldsData.NO_RATING;
			const ageRating = game.age_ratings.map(ageRating => `${ageRating.category === 1 ? 'ESRB' : 'PEGI'}: ${IgdbAgeRating[ageRating.rating]}`);
			const genres = game.genres.map(genre => genre.name).join(', ');
			const developers = game.involved_companies
				? game.involved_companies.map(company => company.developer ? company.company.name : null).filter(Boolean).join(', ')
				: fieldsData.NO_DEVELOPERS;
			const platforms = game.platforms
				? game.platforms.map(platform => platform.name).join(', ')
				: fieldsData.NO_PLATFORMS;
			const releaseDate = game.release_dates && game.release_dates.length
				? this.releaseDateTimestamp.displayUTC(game.release_dates[0].date)
				: fieldsData.NO_RELEASE_DATE;

			display.addPage((embed: MessageEmbed) => embed
				.setTitle(game.name)
				.setURL(game.url)
				.setThumbnail(coverImg)
				.setDescription(cutText(game.summary, 750))
				.addField(titles.USER_SCORE, userRating)
				.addField(titles.AGE_RATING, ageRating)
				.addField(titles.RELEASE_DATE, releaseDate)
				.addField(titles.GENRES, genres)
				.addField(titles.DEVELOPERS, developers)
				.addField(titles.PLATFORMS, platforms));
		}

		return display;
	}

	/** Helper function to properly round up or down a number */
	private roundNumber(num: number, scale = 0) {
		if (!num.toString().includes('e')) {
			return Number(`${Math.round(Number(`${num}e+${scale}`))}e-${scale}`);
		}
		const arr = `${num}`.split('e');
		let sig = '';

		if (Number(arr[1]) + scale > 0) {
			sig = '+';
		}

		return Number(`${Math.round(Number(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`))}e-${scale}`);
	}

}

interface IgdbGame {
	id: number;
	name: string;
	rating?: number;
	summary: string;
	url: string;
	age_ratings: {
		id: number;
		category: number;
		rating: number;
	}[];
	cover: {
		id: number;
		url: string;
	};
	genres: {
		id: number;
		name: string;
	}[];
	involved_companies?: {
		id: number;
		developer: boolean;
		company: {
			id: number;
			name: string;
		};
	}[];
	platforms?: {
		id: number;
		name: string;
	}[];
	release_dates?: {
		id: string;
		date: number;
	}[];
}
