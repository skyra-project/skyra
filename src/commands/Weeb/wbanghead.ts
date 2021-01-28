import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BangHeadDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangHeadExtended,
	queryType: 'banghead',
	responseName: LanguageKeys.Commands.Weeb.BangHead
})
export class UserWeebCommand extends WeebCommand {}
