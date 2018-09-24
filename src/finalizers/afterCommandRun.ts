const { Finalizer } = require('../index');

module.exports = class extends Finalizer {

	run() {
		this.client.usageStatus.cmd[95]++;
	}

};
