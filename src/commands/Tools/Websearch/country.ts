import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetch } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const mapNativeName = (data: { name: string; nativeName: string }) => `${data.name} ${data.nativeName === data.name ? '' : `(${data.nativeName})`}`;
const mapCurrency = (currency: CurrencyData) => `${currency.name} (${currency.symbol})`;

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.tget('COMMAND_COUNTRY_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_COUNTRY_EXTENDED'),
	usage: '<country:str>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [countryName]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.tget('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);

		const countries = await this.fetchAPI(message, countryName);
		if (countries.length === 0) throw message.language.tget('SYSTEM_QUERY_FAIL');

		const display = await this.buildDisplay(message, countries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, countryName: string) {
		const apiResult = await fetch<CountryResultOk>(`https://restcountries.eu/rest/v2/name/${encodeURIComponent(countryName)}`).catch(() => {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		});
		return apiResult;
	}

	private async buildDisplay(message: KlasaMessage, countries: CountryResultOk) {
		const titles = message.language.tget('COMMAND_COUNTRY_TITLES');
		const fieldsData = message.language.tget('COMMAND_COUNTRY_FIELDS');
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
							`${fieldsData.OVERVIEW.OFFICIAL_NAME}: ${country.altSpellings[2] ?? country.name}`,
							`${fieldsData.OVERVIEW.CAPITAL}: ${country.capital}`,
							`${fieldsData.OVERVIEW.POPULATION}: ${country.population.toLocaleString(message.language.name)}`
						].join('\n')
					)
					.addField(titles.LANGUAGES, country.languages.map(mapNativeName).join('\n'))
					.addField(
						titles.OTHER,
						[
							`${fieldsData.OTHER.DEMONYM}: ${country.demonym}`,
							`${fieldsData.OTHER.AREA}: ${country.area.toLocaleString(message.language.name)} sq. km`,
							`${fieldsData.OTHER.CURRENCIES}: ${country.currencies.map(mapCurrency).join(', ')}`
						].join('\n')
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
	area: number;
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
