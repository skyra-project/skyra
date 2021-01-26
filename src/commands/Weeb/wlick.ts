import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.LickDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.LickExtended,
	queryType: 'lick',
	responseName: LanguageKeys.Commands.Weeb.Lick,
	requireUser: true
})
export class UserWeebCommand extends WeebCommand {}
