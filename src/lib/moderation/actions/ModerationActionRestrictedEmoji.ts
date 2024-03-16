import { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { PermissionFlagsBits } from 'discord.js';

export class ModerationActionRestrictedEmoji extends RoleModerationAction {
	public constructor() {
		super({
			type: TypeVariation.RestrictedEmoji,
			logPrefix: 'Moderation => RestrictedEmoji',
			roleKey: RoleModerationAction.RoleKey.Emoji,
			roleData: { name: 'Emoji Restricted', permissions: [], hoist: false, mentionable: false },
			roleOverridesText: PermissionFlagsBits.UseExternalEmojis | PermissionFlagsBits.UseExternalStickers,
			roleOverridesVoice: null
		});
	}
}
