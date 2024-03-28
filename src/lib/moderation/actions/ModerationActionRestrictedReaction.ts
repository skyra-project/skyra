import { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { PermissionFlagsBits } from 'discord.js';

export class ModerationActionRestrictedReaction extends RoleModerationAction<never, TypeVariation.RestrictedReaction> {
	public constructor() {
		super({
			type: TypeVariation.RestrictedReaction,
			logPrefix: 'Moderation => RestrictedReaction',
			roleKey: RoleModerationAction.RoleKey.Reaction,
			roleData: { name: 'Reaction Restricted', permissions: [], hoist: false, mentionable: false },
			roleOverridesText: PermissionFlagsBits.AddReactions,
			roleOverridesVoice: null
		});
	}
}
