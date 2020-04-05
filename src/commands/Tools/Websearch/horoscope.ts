import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes, getColor, createPick } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_HOROSCOPE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_HOROSCOPE_EXTENDED'),
	requiredGuildPermissions: ['EMBED_LINKS'],
	usage: '<sunsign:sunsign> [tomorrow|yesterday|today:default]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	private readonly kSunSigns = new Set(['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius']);
	private readonly kRandomSunSign = createPick([...this.kSunSigns]);

	public async init() {
		this.createCustomResolver('sunsign', (arg, _, message) => {
			if (this.kSunSigns.has(arg.toLowerCase())) return arg.toLowerCase();

			throw message.language.tget('COMMAND_HOROSCOPE_INVALID_SUNSIGN', arg, this.kRandomSunSign());
		});
	}

	public async run(message: KlasaMessage, [sign, when]: [string, 'tomorrow' | 'yesterday' | 'today']) {
		const { horoscope, date, sunsign, meta: { intensity, keywords, mood } } = await this.fetchAPI(message, sign, when);

		const TITLES = message.language.tget('COMMAND_HOROSCOPE_TITLES');
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(horoscope)
			.setTitle(TITLES.DAILY_HOROSCOPE(sunsign))
			.setTimestamp(new Date(date))
			.addField(TITLES.METADATA_TITLE, TITLES.METADATA(intensity, keywords, mood)));
	}

	private fetchAPI(message: KlasaMessage, sunsign: string, when: string) {
		const url = new URL(`https://theastrologer-api.herokuapp.com/api/horoscope/${sunsign}/${when}`);

		return fetch(url, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('COMMAND_HOROSCOPE_INVALID_SUNSIGN', sunsign, this.kRandomSunSign()); }) as Promise<SunSignResponse>;
	}


}

interface SunSignResponse {
	date: string;
	horoscope: string;
	sunsign: string;
	meta: {
		intensity: string;
		keywords: string;
		mood: string;
	};
}
