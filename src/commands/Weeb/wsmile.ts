import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.SmileDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SmileExtended,
	queryType: 'smile',
	responseName: LanguageKeys.Commands.Weeb.Smile
})
export default class extends WeebCommand {}
