import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<WeebCommand.Options>({
	description: LanguageKeys.Commands.Weeb.ThumbsUpDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.ThumbsUpExtended,
	queryType: 'thumbsup',
	responseName: LanguageKeys.Commands.Weeb.ThumbsUp
})
export class UserWeebCommand extends WeebCommand {}
