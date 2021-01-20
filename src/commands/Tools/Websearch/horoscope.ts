import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchSaelem, getHoroscope } from '#utils/APIs/Saelem';
import { Emojis } from '#utils/constants';
import { createPick } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import type { Days, Sunsigns } from '@skyra/saelem';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

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

@ApplyOptions<SkyraCommand.Options>({
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
	public async run(message: Message, [sign, day]: [Sunsigns, Days]) {
		const t = await message.fetchT();
		const { date, intensity, keywords, mood, prediction, rating } = await this.fetchAPI(t, sign, day);

		const titles = t(LanguageKeys.Commands.Tools.HoroscopeTitles, {
			sign,
			intensity,
			keywords,
			mood,
			rating: `${Emojis.Star.repeat(rating)}${Emojis.StarEmpty.repeat(5 - rating)}`
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
