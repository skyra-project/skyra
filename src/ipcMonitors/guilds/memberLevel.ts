import { KlasaMessage } from 'klasa';
import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID, memberID, level }: { guildID: string; memberID: string; level: number }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild.members.get(memberID);
			// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
			if (member) return (await this.client.permissionLevels.run({ guild, member, author: member.user } as KlasaMessage, level)).permission;
			return null;
		}
		return null;
	}

}
