import { Permissions, GuildMember } from 'discord.js';
import { Task } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../lib/util/constants';
import { removeMute } from '../lib/util/util';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: any): Promise<void> {
		// Get the guild
		const guild = this.client.guilds.get(doc[ModerationSchemaKeys.Guild]);

		if (!guild) return;
		await removeMute(guild, doc[ModerationSchemaKeys.User]);

		// And check for permissions
		if (!guild!.me!.permissions.has(FLAGS.MANAGE_ROLES)) return;

		// Check if the user is still muted
		const modlog = await guild!.moderation.fetch(doc[ModerationSchemaKeys.Case] as number);
		if (!modlog || modlog.appealed) return;

		await modlog.appeal();

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc[ModerationSchemaKeys.User]);
		const member = await guild!.members.fetch(user.id).catch(() => null) as GuildMember | null;

		// If the member is found, update the roles
		if (member) {
			const { position } = guild!.me!.roles.highest;
			const rolesMute = guild!.settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted;
			const roles = (modlog[ModerationSchemaKeys.ExtraData] as string[] || [])
				.concat(member.roles.filter(role => role.id !== rolesMute && role.position < position && !role.managed).map(role => role.id));
			await member.edit({ roles }).catch(() => null);
		}

		// Send the modlog
		await guild!.moderation.new
			.setModerator(this.client.user!.id)
			.setUser(user)
			.setType(ModerationTypeKeys.UnMute)
			.setReason(`Mute released after ${this.client.languages.default.duration(doc[ModerationSchemaKeys.Duration])}`)
			.create();
	}

}
