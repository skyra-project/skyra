import { Event } from 'klasa';

const kReg = /(Sending a heartbeat|Latency of|\[VOICE])/i;

export default class extends Event {
	public run(message: string) {
		if (this.context.client.ready && !kReg.test(message)) this.context.client.console.debug(message);
	}

	public async init() {
		if (!this.context.client.options.consoleEvents.debug) await this.unload();
	}
}
