import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.SleepyDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SleepyExtended,
	queryType: 'sleepy',
	responseName: LanguageKeys.Commands.Weeb.Sleepy
})
export default class extends WeebCommand {}
