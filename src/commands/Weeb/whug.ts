import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWhugDescription'),
	extendedHelp: (language) => language.get('commandWhugExtended'),
	queryType: 'hug',
	responseName: 'commandWhug',
	usage: '<user:username>'
})
export default class extends WeebCommand {}
