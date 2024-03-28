import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedAttachment;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['restricted-attachment', 'ra'],
	description: LanguageKeys.Commands.Moderation.RestrictAttachmentDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictAttachmentExtended,
	type: TypeVariation.RestrictedAttachment
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
