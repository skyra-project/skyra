import { IPCMonitor } from '../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run(): Promise<string> {
		return this.client.invite;
	}

}
