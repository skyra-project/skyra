import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWlewdDescription'),
	extendedHelp: (language) => language.get('commandWlewdExtended'),
	queryType: 'lewd',
	responseName: 'commandWlewd'
})
export default class extends WeebCommand {}
