import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetchSaelem, getHoroscope } from '#utils/APIs/Saelem';
import { Emojis } from '#utils/constants';
import { createPick } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { send } from '@sapphire/plugin-editable-commands';
import { Days, Sunsigns } from '@skyra/saelem';
import { Message, MessageEmbed } from 'discord.js';

const kSunSigns = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'];
const kRandomSunSign = createPick(kSunSigns);
const kDays = ['yesterday', 'tomorrow', 'today'];

@ApplyOptions<SkyraCommand.Options>({
	enabled: envParseBoolean('SAELEM_ENABLED'),
	aliases: ['saelem'],
	description: LanguageKeys.Commands.Tools.HoroscopeDescription,
	extendedHelp: LanguageKeys.Commands.Tools.HoroscopeExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const sign = await args.pick(UserCommand.sunsign);
		const day = args.finished ? Days.Today : await args.pick(UserCommand.day);

		const { t } = args;
		const { date, intensity, keywords, mood, prediction, rating } = await this.fetchAPI(sign, day);

		const titles = t(LanguageKeys.Commands.Tools.HoroscopeTitles, {
			sign,
			intensity,
			keywords,
			mood,
			rating: `${Emojis.Star.repeat(rating)}${Emojis.StarEmpty.repeat(5 - rating)}`
		});

		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setDescription(prediction)
			.setTitle(titles.dailyHoroscope)
			.setTimestamp(new Date(date))
			.addField(titles.metadataTitle, titles.metadata.join('\n'));
		return send(message, { embeds: [embed] });
	}

	private async fetchAPI(sunsign: Sunsigns, day: Days) {
		try {
			const { data } = await fetchSaelem<'getHoroscope'>(getHoroscope, { sunsign, day });
			return data.getHoroscope;
		} catch {
			this.error(LanguageKeys.Commands.Tools.HoroscopeInvalidSunsign, { parameter: sunsign, maybe: kRandomSunSign() });
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
