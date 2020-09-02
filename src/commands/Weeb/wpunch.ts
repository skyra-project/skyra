import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWpunchDescription'),
	extendedHelp: (language) => language.get('commandWpunchExtended'),
	queryType: 'punch',
	responseName: 'commandWpunch',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
