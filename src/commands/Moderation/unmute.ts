import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.Mute;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['um'],
	description: LanguageKeys.Commands.Moderation.UnmuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnmuteExtended,
	type: TypeVariation.Mute,
	isUndoAction: true
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
