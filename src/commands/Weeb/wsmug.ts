import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.SmugDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.SmugExtended),
	queryType: 'smug',
	responseName: LanguageKeys.Commands.Weeb.Smug
})
export default class extends WeebCommand {}
