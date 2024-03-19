import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';

type Type = TypeVariation.Mute;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['m'],
	description: LanguageKeys.Commands.Moderation.MuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.MuteExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	type: TypeVariation.Mute
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
