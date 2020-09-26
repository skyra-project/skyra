import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.BangheadDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.BangheadExtended),
	queryType: 'banghead',
	responseName: LanguageKeys.Commands.Weeb.Banghead
})
export default class extends WeebCommand {}
