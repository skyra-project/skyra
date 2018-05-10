const { API } = require('../../index');

module.exports = class extends API {

	run() {
		return this.client.ws.shards
			// Internal Sharding Support
			? this.client.ws.shards.map(shard => shard.status)
			// Without Sharding
			: [this.client.ws.connection.status];
	}

};
