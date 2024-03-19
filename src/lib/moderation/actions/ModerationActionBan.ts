import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionBan extends ModerationAction<number, TypeVariation.Ban> {
	public constructor() {
		super({
			type: TypeVariation.Ban,
			isUndoActionAvailable: true,
			logPrefix: 'Moderation => Ban'
		});
	}

	public override async isActive(guild: Guild, userId: Snowflake) {
		const ban = await resolveOnErrorCodes(guild.bans.fetch({ user: userId, cache: false }), RESTJSONErrorCodes.UnknownBan);
		return !isNullish(ban);
	}

	protected override async handleApplyPost(guild: Guild, entry: ModerationAction.Entry, data: ModerationAction.Data<number>) {
		const reason = await this.getReason(guild, entry.reason);
		await api().guilds.banUser(guild.id, entry.userId, { delete_message_seconds: data.context ?? 0 }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: entry.userId });
	}

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason, true);
		await api().guilds.unbanUser(guild.id, entry.userId, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: entry.userId });
	}
}
