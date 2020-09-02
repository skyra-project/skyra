import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWcryDescription'),
	extendedHelp: (language) => language.get('commandWcryExtended'),
	queryType: 'cry',
	responseName: 'commandWcry',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
