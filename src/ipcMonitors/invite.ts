import { IPCMonitor } from '../index';

export default class extends IPCMonitor {

	run() {
		return this.client.invite;
	}

};
