import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWbangDescription'),
	extendedHelp: (language) => language.get('commandWbangExtended'),
	queryType: 'bang',
	responseName: 'commandWbang',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
