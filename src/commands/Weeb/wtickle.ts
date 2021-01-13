import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.TickleDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.TickleExtended,
	queryType: 'tickle',
	responseName: LanguageKeys.Commands.Weeb.Tickle,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
