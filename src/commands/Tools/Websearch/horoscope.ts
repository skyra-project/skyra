import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchSaelem, getHoroscope } from '#utils/APIs/Saelem';
import { Emojis } from '#utils/constants';
import { createPick } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Days, Sunsigns } from '@skyra/saelem';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const kSunSigns = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'];
const kRandomSunSign = createPick(kSunSigns);
const kDays = ['yesterday', 'tomorrow', 'today'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['saelem'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.HoroscopeDescription,
	extendedHelp: LanguageKeys.Commands.Tools.HoroscopeExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const sign = await args.pick(UserCommand.sunsign);
		const day = args.finished ? Days.Today : await args.pick(UserCommand.day);

		const { t } = args;
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

	private static sunsign = Args.make<Sunsigns>((parameter, { argument }) => {
		const lowerCasedArgument = parameter.toLowerCase();
		if (kSunSigns.includes(lowerCasedArgument)) return Args.ok(lowerCasedArgument as Sunsigns);
		return Args.error({
			parameter,
			argument,
			identifier: LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign,
			context: { maybe: kRandomSunSign() }
		});
	});

	private static day = Args.make<Days>((parameter, { argument }) => {
		const lowerCasedArgument = parameter.toLowerCase();
		if (kDays.includes(lowerCasedArgument)) return Args.ok(lowerCasedArgument as Days);
		return Args.error({
			parameter,
			argument,
			identifier: LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign,
			context: { maybe: kRandomSunSign() }
		});
	});
}
