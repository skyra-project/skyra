import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.HugDescription,
	detailedDescription: LanguageKeys.Commands.Weeb.HugExtended,
	queryType: 'hug',
	responseName: LanguageKeys.Commands.Weeb.Hug,
	requireUser: true
})
export class UserWeebCommand extends WeebCommand {}
