import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.SleepyDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.SleepyExtended),
	queryType: 'sleepy',
	responseName: LanguageKeys.Commands.Weeb.Sleepy
})
export default class extends WeebCommand {}
