import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.PunchDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PunchExtended,
	queryType: 'punch',
	responseName: LanguageKeys.Commands.Weeb.Punch,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
