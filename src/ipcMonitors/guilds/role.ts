import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID, roleID }: { guildID: string; roleID: string }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const role = guild.roles.get(roleID);
			if (role) return role.toJSON();
		}
		return null;
	}

}
