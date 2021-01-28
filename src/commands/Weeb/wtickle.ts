import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.TickleDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.TickleExtended,
	queryType: 'tickle',
	responseName: LanguageKeys.Commands.Weeb.Tickle,
	requireUser: true
})
export class UserWeebCommand extends WeebCommand {}
