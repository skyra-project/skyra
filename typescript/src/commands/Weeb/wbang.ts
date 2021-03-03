import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.BangDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.BangExtended,
	queryType: 'bang',
	responseName: LanguageKeys.Commands.Weeb.Bang,
	requireUser: true
})
export class UserWeebCommand extends WeebCommand {}
