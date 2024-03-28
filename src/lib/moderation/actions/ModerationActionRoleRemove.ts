import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Role } from 'discord.js';

export class ModerationActionRoleRemove extends ModerationAction<Role, TypeVariation.RoleRemove> {
	public constructor() {
		super({
			type: TypeVariation.RoleRemove,
			isUndoActionAvailable: true,
			logPrefix: 'Moderation => RoleRemove'
		});
	}

	public override async isActive(guild: Guild, userId: string, context: Role) {
		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return !isNullish(member) && member.roles.cache.has(context.id);
	}

	protected override async handleApplyPre(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<Role>) {
		const role = data.context!;
		await api().guilds.removeRoleFromMember(guild.id, entry.userId, role.id, {
			reason: await this.getReason(guild, entry.reason)
		});

		await this.completeLastModerationEntryFromUser({
			guild,
			userId: entry.userId,
			filter: (log) => log.extraData?.role === role.id
		});
	}

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<Role>) {
		const role = data.context!;
		await api().guilds.addRoleToMember(guild.id, entry.userId, role.id, { reason: entry.reason ?? undefined });

		await this.completeLastModerationEntryFromUser({
			guild,
			userId: entry.userId,
			filter: (log) => log.extraData?.role === role.id
		});
	}

	protected override resolveOptionsExtraData(_guild: Guild, _options: ModerationAction.PartialOptions, data: ModerationAction.Data<Role>) {
		return { role: data.context!.id };
	}
}
