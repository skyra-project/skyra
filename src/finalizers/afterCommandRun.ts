const { Finalizer } = require('../index');

export default class extends Finalizer {

	public run() {
		this.client.usageStatus.cmd[95]++;
	}

}
