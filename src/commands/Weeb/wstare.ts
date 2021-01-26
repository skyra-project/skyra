import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.StareDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.StareExtended,
	queryType: 'stare',
	responseName: LanguageKeys.Commands.Weeb.Stare,
	requireUser: true
})
export class UserWeebCommand extends WeebCommand {}
