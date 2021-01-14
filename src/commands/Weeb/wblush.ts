import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.BlushDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BlushExtended,
	queryType: 'blush',
	responseName: LanguageKeys.Commands.Weeb.Blush
})
export default class extends WeebCommand {}
