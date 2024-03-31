import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Timeout;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	description: LanguageKeys.Commands.Moderation.TimeoutApplyDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.TimeoutApplyExtended,
	requiredClientPermissions: [PermissionFlagsBits.ModerateMembers],
	requiredMember: true,
	type: TypeVariation.Timeout
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	protected override async checkTargetCanBeModerated(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const member = await super.checkTargetCanBeModerated(message, context);
		if (member && !member.moderatable) throw context.args.t(LanguageKeys.Commands.Moderation.TimeoutNotModeratable);
		return member;
	}
}
