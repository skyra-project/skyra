const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	run() {
		return this.client.guilds.map(ToJSON.guild);
	}

};
