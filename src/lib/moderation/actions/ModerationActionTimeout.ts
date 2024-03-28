import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionTimeout extends ModerationAction<TypeVariation.Timeout> {
	public constructor() {
		super({
			type: TypeVariation.Timeout,
			isUndoActionAvailable: true,
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

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason, true);
		await api().guilds.editMember(guild.id, entry.userId, { communication_disabled_until: null }, { reason });

		await this.completeLastModerationEntryFromUser({ guild, userId: entry.userId });
	}
}
