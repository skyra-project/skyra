import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.DanceDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.DanceExtended,
	queryType: 'dance',
	responseName: LanguageKeys.Commands.Weeb.Dance
})
export default class extends WeebCommand {}
