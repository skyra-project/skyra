import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BiteDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BiteExtended,
	queryType: 'bite',
	responseName: LanguageKeys.Commands.Weeb.Bite,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
