import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.NekoDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.NekoExtended),
	queryType: 'neko',
	responseName: LanguageKeys.Commands.Weeb.Neko
})
export default class extends WeebCommand {}
