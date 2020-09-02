import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWgreetDescription'),
	extendedHelp: (language) => language.get('commandWgreetExtended'),
	queryType: 'greet',
	responseName: 'commandWgreet',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
