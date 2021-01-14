import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.CryDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.CryExtended,
	queryType: 'cry',
	responseName: LanguageKeys.Commands.Weeb.Cry,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
