import { Argument, KlasaMessage, Possible, Duration, util } from 'klasa';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		const duration = new Duration(arg);

		if (duration.offset <= 0 || !util.isNumber(duration.fromNow.getTime())) {
			throw message.language.tget('RESOLVER_INVALID_DURATION', possible.name);
		}

		const { min, max } = possible;
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2341
		return Argument.minOrMax(this.client, duration.offset, min, max, possible, message, '') ? duration.offset : null;
	}

}
