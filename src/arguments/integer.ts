import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['int'] });
	}

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw message.language.get('RESOLVER_INVALID_INT', possible.name);

		const number = Number(arg);
		if (!Number.isInteger(number)) throw message.language.get('RESOLVER_INVALID_INT', possible.name);

		const { min, max } = possible;
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2341
		return Argument.minOrMax(this.client, number, min, max, possible, message, '') ? number : null;
	}

}
