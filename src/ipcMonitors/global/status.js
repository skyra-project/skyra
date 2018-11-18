const { IPCMonitor } = require('../../index');

module.exports = class extends IPCMonitor {

	run() {
		return {
			response: this.client.ws.shards
				// Internal Sharding Support
				? this.client.ws.shards.map(shard => shard.status)
				// Without Sharding
				: [this.client.ws.connection.status]
		};
	}

};
