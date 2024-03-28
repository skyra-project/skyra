import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';

type Type = TypeVariation.Warning;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['w', 'warning'],
	description: LanguageKeys.Commands.Moderation.WarnDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.WarnExtended,
	requiredMember: true,
	type: TypeVariation.Warning
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {}
