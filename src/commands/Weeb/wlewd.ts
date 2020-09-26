import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.LewdDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.LewdExtended),
	queryType: 'lewd',
	responseName: LanguageKeys.Commands.Weeb.Lewd
})
export default class extends WeebCommand {}
