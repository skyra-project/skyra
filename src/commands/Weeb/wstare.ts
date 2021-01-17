import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.StareDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.StareExtended,
	queryType: 'stare',
	responseName: LanguageKeys.Commands.Weeb.Stare,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
