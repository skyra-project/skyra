import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedReaction;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['restricted-reaction', 'rr'],
	description: LanguageKeys.Commands.Moderation.RestrictReactionDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictReactionExtended,
	type: TypeVariation.RestrictedReaction
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
