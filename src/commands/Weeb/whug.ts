import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.HugDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.HugExtended,
	queryType: 'hug',
	responseName: LanguageKeys.Commands.Weeb.Hug,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
