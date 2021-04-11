import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.LewdDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.LewdExtended,
	queryType: 'lewd',
	responseName: LanguageKeys.Commands.Weeb.Lewd
})
export class UserWeebCommand extends WeebCommand {}
