import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { TOKENS, NAME, VERSION } from '@root/config';
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
	usage: '[amount:integer] <from:string> <to:string> [...]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [amount = 1, fromCurrency, ...toCurrencies]: [number, string, string]) {
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const result = await this.fetchAPI(message, fromCurrency, toCurrencies);

		return message.sendEmbed(this.buildEmbed(message, result, fromCurrency, amount));
	}

	private async fetchAPI(message: KlasaMessage, fromCurrency: string, toCurrency: string[]): Promise<CryptoCompareResultOk> {
		try {
			const url = new URL('https://min-api.cryptocompare.com/data/price');
			url.searchParams.append('fsym', fromCurrency.toUpperCase());
			url.searchParams.append('tsyms', toCurrency.join(',').toUpperCase());
			url.searchParams.append('extraParams', `${NAME} ${VERSION} Discord Bot`);

			const body = await fetch<CryptoCompareResultOk | CryptoCompareResultError>(url, {
				headers: [['authorization', `Apikey ${TOKENS.CRYPTOCOMPARE_KEY}`]]
			}, FetchResultTypes.JSON);

			console.log(`PRICE.TS [${new Date().toISOString()}]`, require('util').inspect(body, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));

			if (Reflect.has(body, 'Message')) throw undefined; // Error is handled in the catch
			return body as CryptoCompareResultOk;
		} catch {
			throw message.language.tget('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		}
	}

	private buildEmbed(message: KlasaMessage, result: CryptoCompareResultOk, fromCurrency: string, fromAmount: number): MessageEmbed {
		const worths: string[] = [];
		for (const [currency, toAmount] of Object.entries(result)) {
			worths.push(`**${roundNumber(fromAmount * toAmount, 2)}** ${currency}`);
		}

		return new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(message.language.tget('COMMAND_PRICE_CURRENCY', fromCurrency, fromAmount, worths))
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
