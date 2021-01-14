import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.SmileDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SmileExtended,
	queryType: 'smile',
	responseName: LanguageKeys.Commands.Weeb.Smile
})
export default class extends WeebCommand {}
