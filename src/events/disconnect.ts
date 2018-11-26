import { Event } from 'klasa';

export default class extends Event {

	public run(err: { code: number; reason: string }): void {
		this.client.console.error(`Disconnected | ${err.code}: ${err.reason}`);
	}

}
