import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.DanceDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.DanceExtended,
	queryType: 'dance',
	responseName: LanguageKeys.Commands.Weeb.Dance
})
export default class extends WeebCommand {}
