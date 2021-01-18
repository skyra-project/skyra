import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.HugDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.HugExtended,
	queryType: 'hug',
	responseName: LanguageKeys.Commands.Weeb.Hug,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
