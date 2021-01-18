import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BangHeadDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangHeadExtended,
	queryType: 'banghead',
	responseName: LanguageKeys.Commands.Weeb.BangHead
})
export default class extends WeebCommand {}
