import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWsmugDescription'),
	extendedHelp: (language) => language.get('commandWsmugExtended'),
	queryType: 'smug',
	responseName: 'commandWsmug'
})
export default class extends WeebCommand {}
