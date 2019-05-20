import { CommandStore, KlasaMessage } from 'klasa';
import { URL } from 'url';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: language => language.get('COMMAND_PRICE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_PRICE_EXTENDED'),
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

		const body = await fetch(url, 'json');

		if (body.Response === 'Error') throw message.language.get('COMMAND_PRICE_CURRENCY_NOT_FOUND');
		return message.sendLocale('COMMAND_PRICE_CURRENCY', [from, to, amount * body[to]]);
	}

}
