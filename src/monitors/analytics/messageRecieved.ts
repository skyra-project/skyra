import { ENABLE_INFLUX } from '@root/config';
import { Monitor } from 'klasa';

export default class MessageRecieved extends Monitor {
	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) return this.disable();
	}

	public run(): void {
		MessageRecieved.messageCount++;
	}

	public static messageCount = 0;
}
