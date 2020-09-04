import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWdanceDescription'),
	extendedHelp: (language) => language.get('commandWdanceExtended'),
	queryType: 'dance',
	responseName: 'commandWdance'
})
export default class extends WeebCommand {}
