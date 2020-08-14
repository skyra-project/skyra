import { Event } from 'klasa';

const kReg = /(Sending a heartbeat|Latency of|\[VOICE])/i;

export default class extends Event {
	public run(message: string) {
		if (this.client.ready && !kReg.test(message)) this.client.console.debug(message);
	}

	public init() {
		if (!this.client.options.consoleEvents.debug) this.disable();
		return Promise.resolve(null);
	}
}
