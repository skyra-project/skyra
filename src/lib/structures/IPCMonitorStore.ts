import { Constructor } from 'discord.js';
import { KlasaClient, Store } from 'klasa';
import { NodeMessage } from 'veza';
import { IPCMonitor } from './IPCMonitor';

export class IPCMonitorStore extends Store<string, IPCMonitor, Constructor<IPCMonitor>> {
	public constructor(client: KlasaClient) {
		// @ts-expect-error 2345
		super(client, 'ipcMonitors', IPCMonitor);
	}

	public async run(message: NodeMessage) {
		if (!Array.isArray(message.data) || message.data.length === 0 || message.data.length > 2) {
			if (message.data) this.client.console.wtf('Invalid Payload', message.data);
			message.reply([0, 'INVALID_PAYLOAD']);
			return;
		}

		const [route, payload = null] = message.data;
		const monitor = this.get(route);
		if (!monitor) {
			message.reply([0, 'unknownRoute']);
			return;
		}

		try {
			const result = await monitor.run(payload);
			message.reply([1, result]);
		} catch (error) {
			message.reply([0, error]);
		}
	}
}
