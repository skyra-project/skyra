import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { BrandingColors } from '#utils/constants';
import { fetch, pickRandom } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const SuperScriptTwo = '\u00B2';
const mapNativeName = (data: { name: string; nativeName: string }) => `${data.name} ${data.nativeName === data.name ? '' : `(${data.nativeName})`}`;
const mapCurrency = (currency: CurrencyData) => `${currency.name} (${currency.symbol})`;

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Tools.CountryDescription,
	extendedHelp: LanguageKeys.Commands.Tools.CountryExtended,
	usage: '<country:str>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [countryName]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const countries = await this.fetchAPI(t, countryName);
		if (countries.length === 0) throw t(LanguageKeys.System.QueryFail);

		const display = await this.buildDisplay(message, t, countries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, countryName: string) {
		try {
			return await fetch<CountryResultOk>(`https://restcountries.eu/rest/v2/name/${encodeURIComponent(countryName)}`);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: Message, t: TFunction, countries: CountryResultOk) {
		const titles = t(LanguageKeys.Commands.Tools.CountryTitles);
		const fieldsData = t(LanguageKeys.Commands.Tools.CountryFields);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const country of countries) {
			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(mapNativeName(country))
					.setThumbnail(`https://raw.githubusercontent.com/hjnilsson/country-flags/master/png250px/${country.alpha2Code.toLowerCase()}.png`)
					.setFooter(`Timezone: ${country.timezone}`)
					.addField(
						titles.OVERVIEW,
						[
							`${fieldsData.overview.officialName}: ${country.altSpellings[2] ?? country.name}`,
							`${fieldsData.overview.capital}: ${country.capital}`,
							`${fieldsData.overview.population}: ${t(LanguageKeys.Globals.NumberValue, { value: country.population })}`
						].join('\n')
					)
					.addField(titles.LANGUAGES, country.languages.map(mapNativeName).join('\n'))
					.addField(
						titles.OTHER,
						[
							`${fieldsData.other.demonym}: ${country.demonym}`,
							country.area
								? `${fieldsData.other.area}: ${t(LanguageKeys.Globals.NumberValue, { value: country.area })} km${SuperScriptTwo}`
								: null,
							`${fieldsData.other.currencies}: ${t(LanguageKeys.Globals.AndListValue, { value: country.currencies.map(mapCurrency) })}`
						]
							.filter(Boolean)
							.join('\n')
					)
			);
		}

		return display;
	}
}

export type CountryResultOk = CountryData[];

export interface CountryData {
	name: string;
	altSpellings: string[];
	alpha2Code: string;
	capital: string;
	nativeName: string;
	demonym: string;
	timezone: string;
	population: number;
	area: number | null;
	languages: CountryLanguage[];
	currencies: CurrencyData[];
}

export interface CountryLanguage {
	name: string;
	nativeName: string;
}

export interface CurrencyData {
	code: string;
	name: string;
	symbol: string;
}
