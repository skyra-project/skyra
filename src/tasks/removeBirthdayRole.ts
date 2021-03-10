import { PartialResponseValue, ResponseType, Task } from '#lib/database';

export class UserTask extends Task {
	public async run(data: RemoveBirthdayRoleData): Promise<PartialResponseValue | null> {
		const guild = this.context.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		const me = guild.me!;
		if (me.permissions.has('MANAGE_ROLES') && me.roles.highest.position > member.roles.highest.position) {
			await member.roles.remove(data.roleID).catch(() => null);
		}

		return { type: ResponseType.Finished };
	}
}

interface RemoveBirthdayRoleData {
	guildID: string;
	roleID: string;
	userID: string;
}
