import { Permissions, GuildMember, Role } from 'discord.js';
import { Task } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../lib/util/constants';
import { removeMute } from '../lib/util/util';
import { SkyraGuildMember } from '../lib/extensions/SkyraGuildMember';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: UnmuteTaskData) {
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
			const rolesMuted = guild!.settings.get(GuildSettings.Roles.Muted);
			const roles = this.extractRoles(member, rolesMuted, position, modlog.extraData as readonly string[] | null);
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

	private extractRoles(member: SkyraGuildMember, muteRole: string, rolePosition: number, rawRoleIDs: readonly string[] | null) {
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
}
