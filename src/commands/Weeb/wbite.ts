import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWbiteDescription'),
	extendedHelp: (language) => language.get('commandWbiteExtended'),
	queryType: 'bite',
	responseName: 'commandWbite',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
