import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWthumbsupDescription'),
	extendedHelp: (language) => language.get('commandWthumbsupExtended'),
	queryType: 'thumbsup',
	responseName: 'commandWthumbsup'
})
export default class extends WeebCommand {}
