import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.BiteDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BiteExtended,
	queryType: 'bite',
	responseName: LanguageKeys.Commands.Weeb.Bite,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
