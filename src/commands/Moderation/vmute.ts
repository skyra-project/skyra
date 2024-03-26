import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
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
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {}
