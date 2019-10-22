import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';
import { TOKENS } from '../../../config';

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

	public async run(message: KlasaMessage, [from, to, amount = 1]: [string, string, number]) {
		from = from.toUpperCase();
		to = to.toUpperCase();

		const url = new URL('https://min-api.cryptocompare.com/data/price');
		url.searchParams.append('fsym', from);
		url.searchParams.append('tsyms', to);

		const body = await fetch(url, {
			headers: [['authorization', `Apikey ${TOKENS.CRYPTOCOMPARE}`]]
		}, 'json') as CryptoCompareResultOk | CryptoCompareResultError;

		if (body.Response === 'Error') throw message.language.tget('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		return message.sendLocale('COMMAND_PRICE_CURRENCY', [from, to, amount * (body as CryptoCompareResultOk)[to]]);
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
