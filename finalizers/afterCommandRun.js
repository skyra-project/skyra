const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	run() {
		this.client.usageStatus.cmd[95]++;
	}

};
