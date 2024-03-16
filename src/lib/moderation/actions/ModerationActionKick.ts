import { api } from '#lib/discord/Api';
import { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import type { Guild } from 'discord.js';

export class ModerationActionKick extends ModerationAction {
	public constructor() {
		super({
			type: TypeVariation.Kick,
			logPrefix: 'Moderation => Kick'
		});
	}

	protected override async handleApplyPost(guild: Guild, options: ModerationAction.Options) {
		await api().guilds.removeMember(guild.id, options.userId, { reason: await this.getReason(guild, options.reason) });
	}
}
