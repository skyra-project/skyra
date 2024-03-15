import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionVoiceMute extends ModerationAction {
	public constructor() {
		super({
			type: TypeVariation.VoiceMute,
			actionKey: 'vmute',
			logPrefix: 'Moderation => VoiceMute'
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
		return member?.voice.serverMute ?? false;
	}

	protected override async handleApplyPre(guild: Guild, options: ModerationAction.Options) {
		const reason = await this.getReason(guild, options.reason);
		await api().guilds.editMember(guild.id, options.userId, { mute: true }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}

	protected override async handleUndoPre(guild: Guild, options: ModerationAction.Options) {
		const reason = await this.getReason(guild, options.reason, true);
		await api().guilds.editMember(guild.id, options.userId, { mute: false }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: options.userId });
	}
}
