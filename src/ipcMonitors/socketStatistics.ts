import { IPCMonitor } from '../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run() {
		const memoryUsage = process.memoryUsage();
		return {
			name: 'skyra',
			presence: null,
			statistics: this.client.ws.shards.map((shard) => ({
				heapTotal: memoryUsage.heapTotal,
				heapUsed: memoryUsage.heapUsed,
				ping: shard.pings,
				status: shard.status
			}))
		};
	}

}
