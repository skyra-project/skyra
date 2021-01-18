import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.LickDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.LickExtended,
	queryType: 'lick',
	responseName: LanguageKeys.Commands.Weeb.Lick,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
