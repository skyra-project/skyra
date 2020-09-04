import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWlickDescription'),
	extendedHelp: (language) => language.get('commandWlickExtended'),
	queryType: 'lick',
	responseName: 'commandWlick',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
