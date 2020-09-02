import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWpoutDescription'),
	extendedHelp: (language) => language.get('commandWpoutExtended'),
	queryType: 'pout',
	responseName: 'commandWpout'
})
export default class extends WeebCommand {}
