import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.NomDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.NomExtended,
	queryType: 'nom',
	responseName: LanguageKeys.Commands.Weeb.Nom
})
export default class extends WeebCommand {}
