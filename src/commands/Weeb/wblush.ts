import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BlushDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BlushExtended,
	queryType: 'blush',
	responseName: LanguageKeys.Commands.Weeb.Blush
})
export class UserWeebCommand extends WeebCommand {}
