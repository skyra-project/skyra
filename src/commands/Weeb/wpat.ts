import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.PatDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PatExtended,
	queryType: 'pat',
	responseName: LanguageKeys.Commands.Weeb.Pat,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
