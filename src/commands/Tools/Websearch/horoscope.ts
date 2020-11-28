import { DbSet } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Emojis } from '#utils/constants';
import { fetchSaelem, getHoroscope } from '#utils/Saelem';
import { createPick } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Days, Sunsigns } from '@skyra/saelem';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

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
	description: (language) => language.get(LanguageKeys.Commands.Tools.HoroscopeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.HoroscopeExtended),
	requiredGuildPermissions: ['EMBED_LINKS'],
	usage: '<sunsign:sunsign> [tomorrow|yesterday|today:default]',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'sunsign',
		async (arg, _, message) => {
			const lowerCasedArgument = arg.toLowerCase();
			if (kSunSigns.has(lowerCasedArgument)) return lowerCasedArgument;

			throw await message.fetchLocale(LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign, { sign: arg, maybe: kRandomSunSign() });
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [sign, day]: [Sunsigns, Days]) {
		const language = await message.fetchLanguage();
		const { date, intensity, keywords, mood, prediction, rating } = await this.fetchAPI(language, sign, day);

		const titles = language.get(LanguageKeys.Commands.Tools.HoroscopeTitles, {
			sign,
			intensity,
			keywords,
			mood,
			rating: `${Emojis.Star.repeat(rating)}${Emojis.StarEmpty.repeat(5 - rating)}`
		});
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setDescription(prediction)
				.setTitle(titles.dailyHoroscope)
				.setTimestamp(new Date(date))
				.addField(titles.metadataTitle, titles.metadata)
		);
	}

	private async fetchAPI(language: Language, sunsign: Sunsigns, day: Days) {
		try {
			const { data } = await fetchSaelem<'getHoroscope'>(getHoroscope, { sunsign, day });
			return data.getHoroscope;
		} catch {
			throw language.get(LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign, { sign: sunsign, maybe: kRandomSunSign() });
		}
	}
}
