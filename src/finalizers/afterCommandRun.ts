const { Finalizer } = require('../index');

module.exports = class extends Finalizer {

	public run() {
		this.client.usageStatus.cmd[95]++;
	}

};
