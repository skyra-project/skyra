import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.KissDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.KissExtended,
	queryType: 'kiss',
	responseName: LanguageKeys.Commands.Weeb.Kiss,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
