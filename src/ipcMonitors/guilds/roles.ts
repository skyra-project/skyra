import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID }: { guildID: string }) {
		return ((guild) => guild ? guild.roles.map((role) => role.toJSON()) : null)(this.client.guilds.get(guildID));
	}

}
