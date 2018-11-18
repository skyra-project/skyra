const { IPCMonitor } = require('../index');

module.exports = class extends IPCMonitor {

	run() {
		return this.client.invite;
	}

};
