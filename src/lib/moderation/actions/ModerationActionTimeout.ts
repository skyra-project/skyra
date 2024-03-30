import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { days, resolveOnErrorCodes } from '#utils/common';
import { getLogger } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionTimeout extends ModerationAction<TypeVariation.Timeout> {
	public constructor() {
		super({
			type: TypeVariation.Timeout,
			isUndoActionAvailable: true,
			maximumDuration: days(28),
			durationRequired: true,
			durationExternal: true,
			logPrefix: 'Moderation => Timeout'
		});
	}

	public override async isActive(guild: Guild, userId: Snowflake) {
		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return !isNullish(member) && member.isCommunicationDisabled();
	}

	protected override async handleApplyPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason);
		const time = new Date(Date.now() + entry.duration!).toISOString();
		await api().guilds.editMember(guild.id, entry.userId, { communication_disabled_until: time }, { reason });

		await this.completeLastModerationEntryFromUser({ guild, userId: entry.userId });
	}

	protected override handleApplyPreOnStart(guild: Guild, entry: ModerationAction.Entry) {
		getLogger(guild).timeout.set(entry.userId, { userId: entry.moderatorId, reason: entry.reason });
	}

	protected override handleApplyPreOnError(_error: Error, guild: Guild, entry: ModerationAction.Entry) {
		getLogger(guild).timeout.unset(entry.userId);
	}

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason, true);
		await api().guilds.editMember(guild.id, entry.userId, { communication_disabled_until: null }, { reason });

		await this.completeLastModerationEntryFromUser({ guild, userId: entry.userId });
	}

	protected override handleUndoPreOnStart(guild: Guild, entry: ModerationAction.Entry) {
		getLogger(guild).timeout.set(entry.userId, { userId: entry.moderatorId, reason: entry.reason });
	}

	protected override handleUndoPreOnError(_error: Error, guild: Guild, entry: ModerationAction.Entry) {
		getLogger(guild).timeout.unset(entry.userId);
	}
}
