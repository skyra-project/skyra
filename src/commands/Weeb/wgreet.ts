import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.GreetDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.GreetExtended),
	queryType: 'greet',
	responseName: LanguageKeys.Commands.Weeb.Greet,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
