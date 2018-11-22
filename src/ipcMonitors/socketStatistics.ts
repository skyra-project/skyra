import { IPCMonitor } from '../index';

export default class extends IPCMonitor {

	async run() {
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

};
