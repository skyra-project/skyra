import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.LickDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.LickExtended),
	queryType: 'lick',
	responseName: LanguageKeys.Commands.Weeb.Lick,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
