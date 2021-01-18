import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.PoutDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PoutExtended,
	queryType: 'pout',
	responseName: LanguageKeys.Commands.Weeb.Pout
})
export default class extends WeebCommand {}
