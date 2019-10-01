import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public run() {
		return this.client.guilds.map(guild => guild!.toJSON());
	}

}
