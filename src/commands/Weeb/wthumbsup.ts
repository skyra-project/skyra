import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.ThumbsUpDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.ThumbsUpExtended,
	queryType: 'thumbsup',
	responseName: LanguageKeys.Commands.Weeb.ThumbsUp
})
export default class extends WeebCommand {}
