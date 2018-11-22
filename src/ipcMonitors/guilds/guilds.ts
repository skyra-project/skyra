import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	run() {
		return this.client.guilds.map(ToJSON.guild);
	}

};
