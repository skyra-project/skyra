import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.PoutDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PoutExtended,
	queryType: 'pout',
	responseName: LanguageKeys.Commands.Weeb.Pout
})
export default class extends WeebCommand {}
