import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Days, Sunsigns } from '@skyra/saelem';
import { Emojis } from '@utils/constants';
import { fetchSaelem, getHoroscope } from '@utils/Saelem';
import { createPick } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const kSunSigns = new Set([
	'capricorn',
	'aquarius',
	'pisces',
	'aries',
	'taurus',
	'gemini',
	'cancer',
	'leo',
	'virgo',
	'libra',
	'scorpio',
	'sagittarius'
]);
const kRandomSunSign = createPick([...kSunSigns]);

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['saelem'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_HOROSCOPE_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_HOROSCOPE_EXTENDED'),
	requiredGuildPermissions: ['EMBED_LINKS'],
	usage: '<sunsign:sunsign> [tomorrow|yesterday|today:default]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'sunsign',
		(arg, _, message) => {
			const lowerCasedArgument = arg.toLowerCase();
			if (kSunSigns.has(lowerCasedArgument)) return lowerCasedArgument;

			throw message.language.get('COMMAND_HOROSCOPE_INVALID_SUNSIGN', { sign: arg, maybe: kRandomSunSign() });
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [sign, day]: [Sunsigns, Days]) {
		const { date, intensity, keywords, mood, prediction, rating } = await this.fetchAPI(message, sign, day);

		const TITLES = message.language.get('COMMAND_HOROSCOPE_TITLES');
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setDescription(prediction)
				.setTitle(TITLES.DAILY_HOROSCOPE({ sign }))
				.setTimestamp(new Date(date))
				.addField(
					TITLES.METADATA_TITLE,
					TITLES.METADATA({
						intensity,
						keywords,
						mood,
						rating: `${Emojis.Star.repeat(rating)}${Emojis.StarEmpty.repeat(5 - rating)}`
					})
				)
		);
	}

	private async fetchAPI(message: KlasaMessage, sunsign: Sunsigns, day: Days) {
		try {
			const { data } = await fetchSaelem<'getHoroscope'>(getHoroscope, { sunsign, day });
			return data.getHoroscope;
		} catch {
			throw message.language.get('COMMAND_HOROSCOPE_INVALID_SUNSIGN', { sign: sunsign, maybe: kRandomSunSign() });
		}
	}
}
