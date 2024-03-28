import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedEmbed;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['un-restricted-embed', 'ure'],
	description: LanguageKeys.Commands.Moderation.UnrestrictEmbedDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictEmbedExtended,
	type: TypeVariation.RestrictedEmbed,
	isUndoAction: true
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
