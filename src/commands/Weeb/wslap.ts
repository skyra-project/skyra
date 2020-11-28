import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.SlapDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.SlapExtended),
	queryType: 'slap',
	responseName: LanguageKeys.Commands.Weeb.Slap,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
