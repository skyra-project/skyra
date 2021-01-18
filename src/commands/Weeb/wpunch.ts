import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.PunchDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PunchExtended,
	queryType: 'punch',
	responseName: LanguageKeys.Commands.Weeb.Punch,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
