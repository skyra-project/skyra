import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.VoiceKick;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['vk', 'vkick'],
	description: LanguageKeys.Commands.Moderation.VoiceKickDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.VoiceKickExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
	requiredMember: true,
	type: TypeVariation.VoiceKick
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	public override async checkModeratable(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.voice.channelId) throw context.args.t(LanguageKeys.Commands.Moderation.GuildMemberNotVoicechannel);
		return member;
	}
}
