import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import type { Guild, Role } from 'discord.js';

export class ModerationActionRoleRemove extends ModerationAction<Role> {
	public constructor() {
		super({
			type: TypeVariation.RemoveRole,
			logPrefix: 'Moderation => RoleRemove'
		});
	}

	protected override async handleApplyPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<Role>) {
		const role = data.context!;
		await api().guilds.removeRoleFromMember(guild.id, options.userId, role.id, {
			reason: await this.getReason(guild, options.reason)
		});

		await this.cancelLastModerationEntryTaskFromUser({
			guild,
			userId: options.userId,
			filter: (log) => (log.extraData as { role?: string })?.role === role.id
		});
	}

	protected override async handleUndoPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<Role>) {
		const role = data.context!;
		await api().guilds.addRoleToMember(guild.id, options.userId, role.id, { reason: options.reason ?? undefined });

		await this.cancelLastModerationEntryTaskFromUser({
			guild,
			userId: options.userId,
			filter: (log) => (log.extraData as { role?: string })?.role === role.id
		});
	}

	protected override resolveOptionsExtraData(_guild: Guild, _options: ModerationAction.PartialOptions, data: ModerationAction.Data<Role>) {
		return { role: data.context!.id };
	}
}
