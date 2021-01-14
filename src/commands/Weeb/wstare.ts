import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.StareDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.StareExtended,
	queryType: 'stare',
	responseName: LanguageKeys.Commands.Weeb.Stare,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
