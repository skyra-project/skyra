import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.CryDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.CryExtended,
	queryType: 'cry',
	responseName: LanguageKeys.Commands.Weeb.Cry,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
