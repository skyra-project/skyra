import { PartialResponseValue, ResponseType, Task } from '#lib/database';
import { seconds } from '#utils/common';
import { Permissions } from 'discord.js';

export class UserTask extends Task {
	private readonly requiredPermissions = new Permissions(Permissions.FLAGS.MANAGE_ROLES);

	public async run(data: RemoveBirthdayRoleData): Promise<PartialResponseValue | null> {
		// Get and check the guild:
		const guild = this.container.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		// If the guild is not available, re-schedule the task by creating
		// another with the same data but happening 30 seconds later.
		if (!guild.available) return { type: ResponseType.Delay, value: seconds(30) };

		// Get and check the member:
		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		// Get and check the role:
		const role = guild.roles.cache.get(data.roleID);
		if (!role) return null;

		const me = guild.me!;
		if (me.permissions.has(this.requiredPermissions) && me.roles.highest.position > role.position) {
			try {
				await member.roles.remove(role).catch(() => null);
			} catch (error) {
				if ((error as Error).name === 'AbortError') {
					// Retry again in 5 seconds if something bad happened
					return { type: ResponseType.Delay, value: seconds(5) };
				}

				this.container.logger.fatal(error);
			}
		}

		return { type: ResponseType.Finished };
	}
}

interface RemoveBirthdayRoleData {
	guildID: string;
	roleID: string;
	userID: string;
}
