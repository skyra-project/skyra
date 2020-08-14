import { IPCMonitor } from '@lib/structures/IPCMonitor';

export default class extends IPCMonitor {
	public run() {
		const memoryUsage = process.memoryUsage();
		return {
			name: 'skyra',
			presence: null,
			statistics: this.client.ws.shards.map((shard) => ({
				heapTotal: memoryUsage.heapTotal,
				heapUsed: memoryUsage.heapUsed,
				ping: [shard.ping, shard.ping, shard.ping],
				status: shard.status
			}))
		};
	}
}
