import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { TOKENS } from '@root/config';
import { fetch, FetchResultTypes } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: language => language.tget('COMMAND_PRICE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PRICE_EXTENDED'),
			usage: '<from:string> <to:string> [amount:integer]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [fromCurrency, toCurrency, amount = 1]: [string, string, number]) {
		fromCurrency = fromCurrency.toUpperCase();
		toCurrency = toCurrency.toUpperCase();

		const url = new URL('https://min-api.cryptocompare.com/data/price');
		url.searchParams.append('fsym', fromCurrency);
		url.searchParams.append('tsyms', toCurrency);

		const body = await fetch(url, {
			headers: [['authorization', `Apikey ${TOKENS.CRYPTOCOMPARE_KEY}`]]
		}, FetchResultTypes.JSON) as CryptoCompareResultOk | CryptoCompareResultError;

		if (body.Response === 'Error') throw message.language.tget('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		return message.sendLocale('COMMAND_PRICE_CURRENCY', [fromCurrency, amount, toCurrency, amount * (body as CryptoCompareResultOk)[toCurrency]]);
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
