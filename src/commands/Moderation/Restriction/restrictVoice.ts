import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedVoice;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['restricted-voice', 'rv'],
	description: LanguageKeys.Commands.Moderation.RestrictVoiceDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictVoiceExtended,
	type: TypeVariation.RestrictedVoice
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
