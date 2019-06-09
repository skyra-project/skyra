import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID, memberID }: { guildID: string; memberID: string }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild!.members.get(memberID);
			if (member) return member.toJSON();
		}
		return null;
	}

}
