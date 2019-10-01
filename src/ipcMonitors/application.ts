import { Duration } from 'klasa';
import { IPCMonitor } from '../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public run() {
		return {
			channels: this.client.channels.size,
			guilds: this.client.guilds.size,
			invite: this.client.invite,
			latency: this.client.ws.ping.toFixed(0),
			memory: process.memoryUsage().heapUsed / 1024 / 1024,
			shards: this.client.options.shardCount,
			uptime: Duration.toNow(Date.now() - (process.uptime() * 1000)),
			users: this.client.users.size,
			...this.client.application
		};
	}

}
