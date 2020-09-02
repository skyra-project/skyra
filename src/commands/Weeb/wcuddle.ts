import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWcuddleDescription'),
	extendedHelp: (language) => language.get('commandWcuddleExtended'),
	queryType: 'cuddle',
	responseName: 'commandWcuddle',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
