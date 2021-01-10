import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetch, pickRandom } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { KlasaMessage } from 'klasa';

const SuperScriptTwo = '\u00B2';
const mapNativeName = (data: { name: string; nativeName: string }) => `${data.name} ${data.nativeName === data.name ? '' : `(${data.nativeName})`}`;
const mapCurrency = (currency: CurrencyData) => `${currency.name} (${currency.symbol})`;

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.Tools.CountryDescription,
	extendedHelp: LanguageKeys.Commands.Tools.CountryExtended,
	usage: '<country:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [countryName]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true }))).setColor(BrandingColors.Secondary)
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

	private async buildDisplay(message: KlasaMessage, t: TFunction, countries: CountryResultOk) {
		const titles = t(LanguageKeys.Commands.Tools.CountryTitles, { returnObjects: true });
		const fieldsData = t(LanguageKeys.Commands.Tools.CountryFields, { returnObjects: true });
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
							`${fieldsData.overview.population}: ${country.population.toLocaleString(t.lng)}`
						].join('\n')
					)
					.addField(titles.LANGUAGES, country.languages.map(mapNativeName).join('\n'))
					.addField(
						titles.OTHER,
						[
							`${fieldsData.other.demonym}: ${country.demonym}`,
							country.area ? `${fieldsData.other.area}: ${country.area.toLocaleString(t.lng)} km${SuperScriptTwo}` : null,
							`${fieldsData.other.currencies}: ${country.currencies.map(mapCurrency).join(', ')}`
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
