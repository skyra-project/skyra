import { Argument, Possible, KlasaMessage } from 'klasa';
import { parseRange } from '@utils/util';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw message.language.get('ARGUMENT_RANGE_INVALID', possible.name);

		const number = Number(arg);
		if (Number.isSafeInteger(number)) return [number];

		const range = parseRange(arg);
		if (range.length === 0) throw message.language.tget('ARGUMENT_RANGE_INVALID', possible.name);
		if (typeof possible.max === 'number' && range.length > possible.max) throw message.language.tget('ARGUMENT_RANGE_MAX', possible.name, possible.max);
		return range;
	}

}
