import { Finalizer } from '../index';

export default class extends Finalizer {

	run() {
		this.client.usageStatus.cmd[95]++;
	}

};
