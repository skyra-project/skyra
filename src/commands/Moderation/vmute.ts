import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.VoiceMute;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['vm'],
	description: LanguageKeys.Commands.Moderation.VmuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.VmuteExtended,
	requiredClientPermissions: [PermissionFlagsBits.MuteMembers],
	requiredMember: true,
	type: TypeVariation.VoiceMute
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	public override async checkModeratable(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkModeratable(message, context);
		if (member && member.voice.serverMute) throw context.args.t(LanguageKeys.Commands.Moderation.MuteMuted);
		return member;
	}
}
