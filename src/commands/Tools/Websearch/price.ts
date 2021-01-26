import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { NAME, TOKENS, VERSION } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { roundNumber } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['currency', 'money', 'exchange'],
	cooldown: 15,
	description: LanguageKeys.Commands.Tools.PriceDescription,
	extendedHelp: LanguageKeys.Commands.Tools.PriceExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const amount = await args.pick('number').catch(() => 1);
		const fromCurrency = await args.pick('string');
		const toCurrencies = await args.repeat('string');

		const { t } = args;
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
