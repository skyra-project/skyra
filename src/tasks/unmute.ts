import { Permissions, GuildMember, Role } from 'discord.js';
import { Task } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../lib/util/constants';
import { removeMute } from '../lib/util/util';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: UnmuteTaskData) {
		// Get the guild
		const guild = this.client.guilds.get(doc.guildID);

		if (!guild) return;
		await removeMute(guild, doc.userID);

		// And check for permissions
		if (!guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return;

		// Check if the user is still muted
		const modlog = await guild.moderation.fetch(doc.caseID);
		if (!modlog || modlog.appealed) return;

		await modlog.appeal();

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc.userID);
		const member = await guild.members.fetch(user.id).catch(() => null);

		// If the member is found, update the roles
		if (member) {
			const { position } = guild.me!.roles.highest;
			const rolesMuted = guild.settings.get(GuildSettings.Roles.Muted);
			const roles = this.extractRoles(member, rolesMuted, position, modlog.extraData as readonly string[] | null);
			await member.edit({ roles }).catch(() => null);
		}

		// Send the modlog
		await guild.moderation.create({
			user_id: user.id,
			moderator_id: this.client.user!.id,
			type: ModerationTypeKeys.UnMute,
			reason: `Mute released after ${this.client.languages.default.duration(doc.duration)}`
		}).create();
	}

	private extractRoles(member: GuildMember, muteRole: string, rolePosition: number, rawRoleIDs: readonly string[] | null) {
		if (rawRoleIDs === null) rawRoleIDs = [];

		const rawRoles = rawRoleIDs.map(id => member.guild.roles.get(id)).filter(role => role) as Role[];
		const roles = new Set<string>(member.roles.keys());

		for (const rawRole of rawRoles) {
			if (rawRole.position < rolePosition) roles.add(rawRole.id);
		}

		roles.delete(muteRole);

		return [...roles];
	}

}

interface UnmuteTaskData {
	[ModerationSchemaKeys.Guild]: string;
	[ModerationSchemaKeys.User]: string;
	[ModerationSchemaKeys.Duration]: number;
	[ModerationSchemaKeys.Case]: number;
}
