import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.CuddleDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.CuddleExtended,
	queryType: 'cuddle',
	responseName: LanguageKeys.Commands.Weeb.Cuddle,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
