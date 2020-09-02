import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWtickleDescription'),
	extendedHelp: (language) => language.get('commandWtickleExtended'),
	queryType: 'tickle',
	responseName: 'commandWtickle',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
