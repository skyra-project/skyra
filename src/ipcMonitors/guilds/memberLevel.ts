import { Message } from 'discord.js';
import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID, memberID, level }: { guildID: string; memberID: string; level: number }): Promise<boolean> {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild.members.get(memberID);
			if (member) return (await this.client.permissionLevels.run({ guild, member, author: member.user } as Message, level)).permission;
			return null;
		}
		return null;
	}

}
