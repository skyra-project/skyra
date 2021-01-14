import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.BangHeadDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangHeadExtended,
	queryType: 'banghead',
	responseName: LanguageKeys.Commands.Weeb.BangHead
})
export default class extends WeebCommand {}
