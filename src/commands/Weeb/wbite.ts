import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.BiteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.BiteExtended),
	queryType: 'bite',
	responseName: LanguageKeys.Commands.Weeb.Bite,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
