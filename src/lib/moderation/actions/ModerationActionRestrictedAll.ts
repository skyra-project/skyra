import { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';
import { PermissionFlagsBits } from 'discord.js';

export class ModerationActionRestrictedAll extends RoleModerationAction<string[], TypeVariation.Mute> {
	public constructor() {
		super({
			type: TypeVariation.Mute,
			logPrefix: 'Moderation => Mute',
			roleKey: RoleModerationAction.RoleKey.All,
			roleData: { name: 'Muted', permissions: [], hoist: false, mentionable: false },
			roleOverridesText:
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.SendMessagesInThreads |
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.UseExternalEmojis |
				PermissionFlagsBits.UseExternalStickers |
				PermissionFlagsBits.UseApplicationCommands |
				PermissionFlagsBits.CreatePublicThreads |
				PermissionFlagsBits.CreatePrivateThreads,
			roleOverridesVoice: PermissionFlagsBits.Connect,
			replace: true
		});
	}
}
