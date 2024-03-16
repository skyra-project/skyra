import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionTimeout extends ModerationAction<number | null> {
	public constructor() {
		super({
			type: TypeVariation.Timeout,
			logPrefix: 'Moderation => Timeout'
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
		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return !isNullish(member) && member.isCommunicationDisabled();
	}

	protected override async handleApplyPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<number>) {
		const reason = await this.getReason(guild, options.reason);
		const time = this.#getCommunicationDisabledUntil(data);
		await api().guilds.editMember(guild.id, options.userId, { communication_disabled_until: time }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	protected override async handleUndoPre(guild: Guild, options: ModerationAction.Options, data: ModerationAction.Data<number>) {
		const reason = await this.getReason(guild, options.reason, true);
		const time = this.#getCommunicationDisabledUntil(data);
		await api().guilds.editMember(guild.id, options.userId, { communication_disabled_until: time }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	#getCommunicationDisabledUntil(data: ModerationAction.Data<number>) {
		return isNullish(data.context) ? null : new Date(data.context).toISOString();
	}
}
