import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedReaction;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['un-restricted-reaction', 'urr'],
	description: LanguageKeys.Commands.Moderation.UnrestrictReactionDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictReactionExtended,
	type: TypeVariation.RestrictedReaction,
	isUndoAction: true
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
