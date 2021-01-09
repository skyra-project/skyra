import { WeebCommand, WeebCommandOptions } from '#lib/structures/WeebCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.ThumbsupDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.ThumbsupExtended,
	queryType: 'thumbsup',
	responseName: LanguageKeys.Commands.Weeb.Thumbsup
})
export default class extends WeebCommand {}
