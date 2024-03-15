import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionBan extends ModerationAction<number> {
	public constructor() {
		super({
			type: TypeVariation.Ban,
			actionKey: 'ban',
			logPrefix: 'Moderation => Ban'
		});
	}

	/**
	 * Checks if this action is active for a given user in a guild.
	 *
	 * @param guild - The guild to check.
	 * @param userId - The ID of the user.
	 * @returns A boolean indicating whether the action is active.
	 */
	public async isActive(guild: Guild, userId: Snowflake) {
		const ban = await resolveOnErrorCodes(guild.bans.fetch({ user: userId, cache: false }), RESTJSONErrorCodes.UnknownBan);
		return !isNullish(ban);
	}

	protected override async handleApplyPost(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<number>) {
		const reason = await this.getReason(guild, options.reason);
		await api().guilds.banUser(guild.id, options.userId, { delete_message_seconds: data.context ?? 0 }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	protected override async handleUndoPre(guild: Guild, options: ModerationAction.Options) {
		const reason = await this.getReason(guild, options.reason, true);
		await api().guilds.unbanUser(guild.id, options.userId, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}
}
