import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { NAME, TOKENS, VERSION } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { roundNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['currency', 'money', 'exchange'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.PriceDescription,
	extendedHelp: LanguageKeys.Commands.Tools.PriceExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '[amount:number] <from:string> <to:string> [...]',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [amount = 1, fromCurrency, ...toCurrencies]: [number, string, string]) {
		const t = await message.fetchT();
		await message.send(new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary));

		const result = await this.fetchAPI(t, fromCurrency, toCurrencies);

		return message.send(await this.buildEmbed(message, t, result, fromCurrency, amount));
	}

	private async fetchAPI(t: TFunction, fromCurrency: string, toCurrency: string[]): Promise<CryptoCompareResultOk> {
		try {
			const url = new URL('https://min-api.cryptocompare.com/data/price');
			url.searchParams.append('fsym', fromCurrency.toUpperCase());
			url.searchParams.append('tsyms', toCurrency.join(',').toUpperCase());
			url.searchParams.append('extraParams', `${NAME} ${VERSION} Discord Bot`);

			const body = await fetch<CryptoCompareResultOk | CryptoCompareResultError>(
				url,
				{
					headers: [['authorization', `Apikey ${TOKENS.CRYPTOCOMPARE_KEY}`]]
				},
				FetchResultTypes.JSON
			);

			if (Reflect.has(body, 'Message')) throw undefined; // Error is handled in the catch
			return body as CryptoCompareResultOk;
		} catch {
			throw t(LanguageKeys.Commands.Tools.PriceCurrencyNotFound);
		}
	}

	private async buildEmbed(message: GuildMessage, t: TFunction, result: CryptoCompareResultOk, fromCurrency: string, fromAmount: number) {
		const worths: string[] = [];
		for (const [currency, toAmount] of Object.entries(result)) {
			worths.push(`**${roundNumber(fromAmount * toAmount, 2)}** ${currency}`);
		}

		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setDescription(t(LanguageKeys.Commands.Tools.PriceCurrency, { fromCurrency, fromAmount, worths }))
			.setTimestamp();
	}
}

export interface CryptoCompareResultError {
	Response: 'Error';
	Message: string;
	HasWarning: boolean;
	Type: number;
	RateLimit: CryptoCompareResultErrorData;
	Data: CryptoCompareResultErrorData;
	ParamWithError: string;
}

export interface CryptoCompareResultErrorData {}

export interface CryptoCompareResultOk extends Record<string, number> {}
