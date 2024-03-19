import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.RestrictedAttachment;
type ValueType = null;

@ApplyOptions<SetUpModerationCommand.Options<Type>>({
	aliases: ['un-restricted-attachment', 'ura'],
	description: LanguageKeys.Commands.Moderation.UnrestrictAttachmentDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictAttachmentExtended,
	type: TypeVariation.RestrictedAttachment,
	isUndoAction: true
})
export class UserSetUpModerationCommand extends SetUpModerationCommand<Type, ValueType> {}
