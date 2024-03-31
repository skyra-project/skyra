import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Timeout;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	description: LanguageKeys.Commands.Moderation.TimeoutUndoDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.TimeoutUndoExtended,
	requiredClientPermissions: [PermissionFlagsBits.ModerateMembers],
	requiredMember: true,
	isUndoAction: true,
	type: TypeVariation.Timeout
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {}
