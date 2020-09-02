import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWblushDescription'),
	extendedHelp: (language) => language.get('commandWblushExtended'),
	queryType: 'blush',
	responseName: 'commandWblush'
})
export default class extends WeebCommand {}
