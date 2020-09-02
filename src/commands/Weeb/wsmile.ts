import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWsmileDescription'),
	extendedHelp: (language) => language.get('commandWsmileExtended'),
	queryType: 'smile',
	responseName: 'commandWsmile'
})
export default class extends WeebCommand {}
