import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.CryDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.CryExtended,
	queryType: 'cry',
	responseName: LanguageKeys.Commands.Weeb.Cry,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
