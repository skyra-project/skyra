import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWslapDescription'),
	extendedHelp: (language) => language.get('commandWslapExtended'),
	queryType: 'slap',
	responseName: 'commandWslap',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
