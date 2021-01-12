import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.BlushDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BlushExtended,
	queryType: 'blush',
	responseName: LanguageKeys.Commands.Weeb.Blush
})
export default class extends WeebCommand {}
