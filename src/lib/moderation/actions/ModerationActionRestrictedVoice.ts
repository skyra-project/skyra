import { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { PermissionFlagsBits } from 'discord.js';

export class ModerationActionRestrictedVoice extends RoleModerationAction {
	public constructor() {
		super({
			type: TypeVariation.RestrictedVoice,
			actionKey: 'restrictedVoice',
			logPrefix: 'Moderation => RestrictedVoice',
			roleKey: RoleModerationAction.RoleKey.Voice,
			roleData: { name: 'Voice Restricted', permissions: [], hoist: false, mentionable: false },
			roleOverridesText: null,
			roleOverridesVoice: PermissionFlagsBits.Connect
		});
	}
}
