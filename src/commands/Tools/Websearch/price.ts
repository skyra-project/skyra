import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { TOKENS } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetch, FetchResultTypes, getColor, roundNumber } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['currency', 'money', 'exchange'],
	cooldown: 15,
	description: language => language.tget('COMMAND_PRICE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_PRICE_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<from:string> <to:string> [amount:integer]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [fromCurrency, toCurrency, amount = 1]: [string, string, number]) {
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		fromCurrency = fromCurrency.toUpperCase();
		toCurrency = toCurrency.toUpperCase();

		const result = await this.fetchAPI(message, fromCurrency, toCurrency);

		return message.sendEmbed(this.buildEmbed(message, result, fromCurrency, toCurrency, amount));
	}

	private async fetchAPI(message: KlasaMessage, fromCurrency: string, toCurrency: string): Promise<CryptoCompareResultOk> {
		try {
			const url = new URL('https://min-api.cryptocompare.com/data/price');
			url.searchParams.append('fsym', fromCurrency);
			url.searchParams.append('tsyms', toCurrency);
			url.searchParams.append('extraParams', 'SkyraApp');

			const body = await fetch<CryptoCompareResultOk | CryptoCompareResultError>(url, {
				headers: [['authorization', `Apikey ${TOKENS.CRYPTOCOMPARE_KEY}`]]
			}, FetchResultTypes.JSON);

			if (body.Response === 'Error') throw undefined; // Error is handled in the catch
			return body as CryptoCompareResultOk;
		} catch {
			throw message.language.tget('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		}
	}

	private buildEmbed(message: KlasaMessage, result: CryptoCompareResultOk, fromCurrency: string, toCurrency: string, amount: number): MessageEmbed {
		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(
				message.language.tget('COMMAND_PRICE_CURRENCY', fromCurrency, amount, toCurrency, roundNumber(amount * result[toCurrency], 2))
			)
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

export interface CryptoCompareResultErrorData { }

export interface CryptoCompareResultOk extends Record<string, number> { }
