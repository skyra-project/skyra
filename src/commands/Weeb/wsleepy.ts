import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.SleepyDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SleepyExtended,
	queryType: 'sleepy',
	responseName: LanguageKeys.Commands.Weeb.Sleepy
})
export class UserWeebCommand extends WeebCommand {}
