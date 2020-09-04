import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWkissDescription'),
	extendedHelp: (language) => language.get('commandWkissExtended'),
	queryType: 'kiss',
	responseName: 'commandWkiss',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
