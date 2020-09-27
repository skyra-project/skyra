import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.BlushDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.BlushExtended),
	queryType: 'blush',
	responseName: LanguageKeys.Commands.Weeb.Blush
})
export default class extends WeebCommand {}
