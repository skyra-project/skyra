import { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { PermissionFlagsBits } from 'discord.js';

export class ModerationActionRestrictedEmbed extends RoleModerationAction {
	public constructor() {
		super({
			type: TypeVariation.RestrictedEmbed,
			actionKey: 'restrictedEmbed',
			logPrefix: 'Moderation => RestrictedEmbed',
			roleKey: RoleModerationAction.RoleKey.Embed,
			roleData: { name: 'Embed Restricted', permissions: [], hoist: false, mentionable: false },
			roleOverridesText: PermissionFlagsBits.EmbedLinks,
			roleOverridesVoice: null
		});
	}
}
