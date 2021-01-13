import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.NekoDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.NekoExtended,
	queryType: 'neko',
	responseName: LanguageKeys.Commands.Weeb.Neko
})
export default class extends WeebCommand {}
