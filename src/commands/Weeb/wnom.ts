import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.NomDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.NomExtended,
	queryType: 'nom',
	responseName: LanguageKeys.Commands.Weeb.Nom
})
export default class extends WeebCommand {}
