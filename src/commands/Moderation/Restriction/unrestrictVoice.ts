import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedVoice;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['un-restricted-voice', 'urv'],
	description: LanguageKeys.Commands.Moderation.UnrestrictVoiceDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictVoiceExtended,
	type: TypeVariation.RestrictedVoice,
	isUndoAction: true
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
