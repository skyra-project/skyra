import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BangDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangExtended,
	queryType: 'bang',
	responseName: LanguageKeys.Commands.Weeb.Bang,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
