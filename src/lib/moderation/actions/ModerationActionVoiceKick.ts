import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import type { Guild } from 'discord.js';

export class ModerationActionVoiceKick extends ModerationAction {
	public constructor() {
		super({
			type: TypeVariation.VoiceKick,
			actionKey: 'vkick',
			logPrefix: 'Moderation => VoiceKick'
		});
	}

	protected override async handleApplyPost(guild: Guild, options: ModerationAction.Options) {
		const reason = await this.getReason(guild, options.reason);
		await api().guilds.editMember(guild.id, options.userId, { channel_id: null }, { reason });
	}
}
