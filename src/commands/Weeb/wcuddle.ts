import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.CuddleDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.CuddleExtended,
	queryType: 'cuddle',
	responseName: LanguageKeys.Commands.Weeb.Cuddle,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
