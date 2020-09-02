import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWnomDescription'),
	extendedHelp: (language) => language.get('commandWnomExtended'),
	queryType: 'nom',
	responseName: 'commandWnom'
})
export default class extends WeebCommand {}
