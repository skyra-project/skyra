import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Weeb.ThumbsupDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Weeb.ThumbsupExtended),
	queryType: 'thumbsup',
	responseName: LanguageKeys.Commands.Weeb.Thumbsup
})
export default class extends WeebCommand {}
