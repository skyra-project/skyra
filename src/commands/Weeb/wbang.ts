import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.BangDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.BangExtended),
	queryType: 'bang',
	responseName: LanguageKeys.Commands.Weeb.Bang,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
