import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWstareDescription'),
	extendedHelp: (language) => language.get('commandWstareExtended'),
	queryType: 'stare',
	responseName: 'commandWstare',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
