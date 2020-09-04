import { WeebCommand, WeebCommandOptions } from '@lib/structures/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: (language) => language.get('commandWbangheadDescription'),
	extendedHelp: (language) => language.get('commandWbangheadExtended'),
	queryType: 'banghead',
	responseName: 'commandWbanghead'
})
export default class extends WeebCommand {}
