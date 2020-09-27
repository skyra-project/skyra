import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.TickleDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.TickleExtended),
	queryType: 'tickle',
	responseName: LanguageKeys.Commands.Weeb.Tickle,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
