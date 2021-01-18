import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.SlapDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SlapExtended,
	queryType: 'slap',
	responseName: LanguageKeys.Commands.Weeb.Slap,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
