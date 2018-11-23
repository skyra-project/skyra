import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run(): Promise<any> {
		return this.client.guilds.map((guild) => guild.toJSON());
	}

}
