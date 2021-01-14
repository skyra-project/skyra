import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.PunchDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PunchExtended,
	queryType: 'punch',
	responseName: LanguageKeys.Commands.Weeb.Punch,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
