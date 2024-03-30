import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { days } from '#utils/common';
import { TypeVariation, type Unlock } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Timeout;
type ValueType = Unlock | null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	description: LanguageKeys.Commands.Moderation.KickDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.KickExtended,
	requiredClientPermissions: [PermissionFlagsBits.ModerateMembers],
	maximumDuration: days(28),
	requiredMember: true,
	requiredDuration: true,
	type: TypeVariation.Timeout
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {}
