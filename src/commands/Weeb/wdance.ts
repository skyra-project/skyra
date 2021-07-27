import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.DanceDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.DanceExtended,
	queryType: 'dance',
	responseName: LanguageKeys.Commands.Weeb.Dance
})
export class UserWeebCommand extends WeebCommand {}
