import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.SmugDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.SmugExtended,
	queryType: 'smug',
	responseName: LanguageKeys.Commands.Weeb.Smug
})
export default class extends WeebCommand {}
