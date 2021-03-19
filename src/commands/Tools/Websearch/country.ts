import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { fetch, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

const SuperScriptTwo = '\u00B2';
const mapNativeName = (data: { name: string; nativeName: string }) => `${data.name} ${data.nativeName === data.name ? '' : `(${data.nativeName})`}`;
const mapCurrency = (currency: CurrencyData) => `${currency.name} (${currency.symbol})`;

@ApplyOptions<PaginatedMessageCommand.Options>({
	description: LanguageKeys.Commands.Tools.CountryDescription,
	extendedHelp: LanguageKeys.Commands.Tools.CountryExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const countryName = await args.rest('string');
		const response = await sendLoadingMessage(message, args.t);

		const countries = await this.fetchAPI(countryName);
		if (countries.length === 0) this.error(LanguageKeys.System.QueryFail);

		const display = await this.buildDisplay(message, args.t, countries);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(countryName: string) {
		try {
			return await fetch<CountryResultOk>(`https://restcountries.eu/rest/v2/name/${encodeURIComponent(countryName)}`);
		} catch {
			this.error(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, countries: CountryResultOk) {
		const titles = t(LanguageKeys.Commands.Tools.CountryTitles);
		const fieldsData = t(LanguageKeys.Commands.Tools.CountryFields);
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		for (const country of countries) {
			display.addPageEmbed((embed) =>
				embed
					.setTitle(mapNativeName(country))
					.setThumbnail(`https://raw.githubusercontent.com/hjnilsson/country-flags/master/png250px/${country.alpha2Code.toLowerCase()}.png`)
					.setFooter(
						` - ${t(LanguageKeys.Commands.Tools.CountryTimezone, { timezone: country.timezones, count: country.timezones.length })}`
					)
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
	timezones: string[];
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
