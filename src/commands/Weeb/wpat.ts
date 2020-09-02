import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWpatDescription'),
	extendedHelp: (language) => language.get('commandWpatExtended'),
	queryType: 'pat',
	responseName: 'commandWpat',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
