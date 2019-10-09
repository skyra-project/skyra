import { Argument, KlasaMessage, Possible, Duration, util } from 'klasa';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		const duration = new Duration(arg);
		if (duration.offset !== 0 && util.isNumber(duration.fromNow.getTime())) return duration.offset;
		throw message.language.get('RESOLVER_INVALID_DURATION', possible.name);
	}

}
