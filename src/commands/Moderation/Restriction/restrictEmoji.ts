import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedEmoji;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['restrict-external-emoji', 'restricted-emoji', 'restricted-external-emoji', 'ree', 'restrict-emojis'],
	description: LanguageKeys.Commands.Moderation.RestrictEmojiDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictEmojiExtended,
	type: TypeVariation.RestrictedEmoji
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
