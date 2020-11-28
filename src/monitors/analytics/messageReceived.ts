import { ENABLE_INFLUX } from '#root/config';
import { Monitor } from 'klasa';

export default class MessageReceived extends Monitor {
	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) this.disable();
	}

	public run(): void {
		this.client.analytics!.messageCount++;
	}

	public static messageCount = 0;
}
