import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedEmbed;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['restricted-embed', 're'],
	description: LanguageKeys.Commands.Moderation.RestrictEmbedDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictEmbedExtended,
	type: TypeVariation.RestrictedEmbed
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
