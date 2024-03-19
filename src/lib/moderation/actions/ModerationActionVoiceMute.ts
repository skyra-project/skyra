import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { resolveOnErrorCodes } from '#utils/common';
import { TypeVariation } from '#utils/moderationConstants';
import { RESTJSONErrorCodes, type Guild, type Snowflake } from 'discord.js';

export class ModerationActionVoiceMute extends ModerationAction<never, TypeVariation.VoiceMute> {
	public constructor() {
		super({
			type: TypeVariation.VoiceMute,
			isUndoActionAvailable: true,
			logPrefix: 'Moderation => VoiceMute'
		});
	}

	public override async isActive(guild: Guild, userId: Snowflake) {
		const member = await resolveOnErrorCodes(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);
		return member?.voice.serverMute ?? false;
	}

	protected override async handleApplyPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason);
		await api().guilds.editMember(guild.id, entry.userId, { mute: true }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: entry.userId });
	}

	protected override async handleUndoPre(guild: Guild, entry: ModerationAction.Entry) {
		const reason = await this.getReason(guild, entry.reason, true);
		await api().guilds.editMember(guild.id, entry.userId, { mute: false }, { reason });

		await this.cancelLastModerationEntryTaskFromUser({ guild, userId: entry.userId });
	}
}
