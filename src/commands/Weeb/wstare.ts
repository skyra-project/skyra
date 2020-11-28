import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.StareDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.StareExtended),
	queryType: 'stare',
	responseName: LanguageKeys.Commands.Weeb.Stare,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
