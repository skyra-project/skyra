import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Emojis } from '#utils/constants';
import { fetchSaelem, getHoroscope } from '#utils/Saelem';
import { createPick } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Days, Sunsigns } from '@skyra/saelem';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
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
	description: LanguageKeys.Commands.Tools.HoroscopeDescription,
	extendedHelp: LanguageKeys.Commands.Tools.HoroscopeExtended,
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

			throw await message.resolveKey(LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign, { sign: arg, maybe: kRandomSunSign() });
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [sign, day]: [Sunsigns, Days]) {
		const t = await message.fetchT();
		const { date, intensity, keywords, mood, prediction, rating } = await this.fetchAPI(t, sign, day);

		const titles = t(LanguageKeys.Commands.Tools.HoroscopeTitles, {
			sign,
			intensity,
			keywords,
			mood,
			rating: `${Emojis.Star.repeat(rating)}${Emojis.StarEmpty.repeat(5 - rating)}`,
			returnObjects: true
		});
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setDescription(prediction)
				.setTitle(titles.dailyHoroscope)
				.setTimestamp(new Date(date))
				.addField(titles.metadataTitle, titles.metadata)
		);
	}

	private async fetchAPI(t: TFunction, sunsign: Sunsigns, day: Days) {
		try {
			const { data } = await fetchSaelem<'getHoroscope'>(getHoroscope, { sunsign, day });
			return data.getHoroscope;
		} catch {
			throw t(LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign, { sign: sunsign, maybe: kRandomSunSign() });
		}
	}
}
