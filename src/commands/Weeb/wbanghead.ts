import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.BangHeadDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangHeadExtended,
	queryType: 'banghead',
	responseName: LanguageKeys.Commands.Weeb.BangHead
})
export default class extends WeebCommand {}
